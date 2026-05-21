import fs from 'fs';
import path from 'path';

const classMap: Record<string, string> = {
  'bg-white': 'dark:bg-[#111827]',
  'bg-gray-50': 'dark:bg-[#0B0F14]',
  'bg-gray-100': 'dark:bg-slate-800',
  'border-gray-200': 'dark:border-white/10',
  'text-gray-900': 'dark:text-white',
  'text-gray-700': 'dark:text-slate-200',
  'text-gray-500': 'dark:text-slate-400',
  'text-gray-400': 'dark:text-slate-500',
  'text-gray-800': 'dark:text-slate-100',
};

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

    // using matchAll or simple replace with function
    // we want to find class="..." or className="..."
    const regex = /class(?:Name)?=["'`](.*?)["'`]/g;
    
    content = content.replace(regex, (match, classString) => {
        const classes = classString.split(/\s+/);
        const newClasses = new Set(classes);
        let changed = false;
        
        for (const cls of classes) {
            // some classes might contain things like '/10' opacity, ignoring it for bg-white etc if not explicitly mapped
            let baseCls = cls;
            // Handle hover: prefixes
            let prefix = '';
            if (baseCls.startsWith('hover:')) {
                prefix = 'hover:';
                baseCls = baseCls.slice(6);
            }

            if (classMap[baseCls]) {
                const darkCls = prefix ? `dark:${prefix}${classMap[baseCls].slice(5)}` : classMap[baseCls];
                if (!newClasses.has(darkCls)) {
                    newClasses.add(darkCls);
                    changed = true;
                }
            }
        }
        
        if (changed) {
            modified = true;
            // reconstructing exactly
            // If the original string had template literals ${...}, it's more complex.
            // A simple replacement just updates the string.
            return match.replace(classString, Array.from(newClasses).join(' '));
        }
        return match;
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Added dark theme to ${filePath}`);
    }
  }
});
