import fs from 'fs';
import path from 'path';

const replacements = [
  { search: /bg-\[#0A0D11\]/g, replace: 'bg-gray-50' },
  { search: /bg-\[#0B0F14\]/g, replace: 'bg-white' },
  { search: /bg-\[#111827\]/g, replace: 'bg-white' },
  { search: /bg-\[#0e1118\]/g, replace: 'bg-white' },
  { search: /bg-\[#141820\]/g, replace: 'bg-white' },
  { search: /bg-\[#191e2b\]/g, replace: 'bg-gray-100' },
  { search: /border-white\/5/g, replace: 'border-gray-200' },
  { search: /border-white\/10/g, replace: 'border-gray-200' },
  { search: /text-slate-200/g, replace: 'text-gray-900' },
  { search: /text-slate-300/g, replace: 'text-gray-700' },
  { search: /text-slate-400/g, replace: 'text-gray-500' },
  { search: /text-slate-500/g, replace: 'text-gray-400' },
  { search: /text-white/g, replace: 'text-gray-900' },
  { search: /bg-slate-800\/30/g, replace: 'bg-gray-50' },
  { search: /bg-slate-900\/40/g, replace: 'bg-white' },
  { search: /bg-slate-900\/50/g, replace: 'bg-gray-50' },
  { search: /border-slate-800/g, replace: 'border-gray-200' },
  { search: /text-[#eef0f5]/g, replace: 'text-gray-900' },
  { search: /bg-[#090b10]/g, replace: 'bg-gray-50' },
  { search: /bg-cyan-500/g, replace: 'bg-purple-700' },
  { search: /text-cyan-400/g, replace: 'text-yellow-400' },
  { search: /text-cyan-500/g, replace: 'text-yellow-400' },
  { search: /border-cyan-500\/30/g, replace: 'border-purple-200' },
  { search: /border-cyan-500\/20/g, replace: 'border-purple-200' },
  { search: /border-cyan-500\/50/g, replace: 'border-purple-300' },
  { search: /bg-cyan-500\/10/g, replace: 'bg-purple-100' },
  { search: /bg-cyan-500\/20/g, replace: 'bg-purple-200' },
  { search: /hover:bg-cyan-500\/20/g, replace: 'hover:bg-purple-800' },
  // Secondary: Royal Purple (#6D28D9) for buttons.
  // Primary (Highlights & Headings & Icons): Sunny Yellow (#FBBF24 -> yellow-400 or amber-400)
  // Accent (Progress, notifications): Electric Teal (#06B6D4 -> cyan-500)
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

    // specific rules for new palette
    // the sed replacements above did:
    // changed cyan-500 backgrounds to purple-700 (buttons mostly)
    // changed cyan-400 text to yellow-400 (highlights mostly)

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  }
});
