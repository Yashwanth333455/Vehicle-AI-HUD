import fs from 'fs';
import path from 'path';

const replacements = [
  { search: /text-gray-900merald/g, replace: 'text-emerald' },
  { search: /gray-900merald/g, replace: 'emerald' },
  { search: /bg-gray-50lue/g, replace: 'bg-blue' },
  { search: /gray-50lue/g, replace: 'blue' },
  { search: /text-gray-900uchsia/g, replace: 'text-fuchsia' },
  { search: /gray-900/g, replace: 'gray-900' } // noop, but just checking if there are others
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
    let modified = true;
    replacements.forEach(({ search, replace }) => {
      if (search.test(content)) {
        content = content.replace(search, replace);
        modified = false;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed ${filePath}`);
    }
  }
});
