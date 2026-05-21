import fs from 'fs';
import path from 'path';

const replacements = [
  { search: /gray-50lack/g, replace: 'black' },
  { search: /bg-gray-50lue-500\/10/g, replace: 'bg-blue-500/10' },
  { search: /bg-gray-50lue-400/g, replace: 'bg-blue-400' },
  { search: /text-gray-900merald-500/g, replace: 'text-emerald-500' },
  { search: /text-gray-900merald-200/g, replace: 'text-emerald-200' },
  { search: /text-gray-900merald-400/g, replace: 'text-emerald-400' },
  { search: /bg-slate-800/g, replace: 'bg-gray-100' },
  { search: /border-slate-800/g, replace: 'border-gray-200' }
];

function walkDir(dir: string, callback: (filePath: string) => void) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./src', (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    replacements.forEach(({ search, replace }) => {
      if (search.test(content)) {
        content = content.replace(search, replace);
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed ${filePath}`);
    }
  }
});
