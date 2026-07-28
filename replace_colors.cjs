const fs = require('fs');
const path = require('path');

const directory = './src';

const colorMap = {
  // Emerald / Green / Teal (Primary equivalents)
  'emerald-50': 'slate-50',
  'emerald-100': 'slate-100',
  'emerald-200': 'slate-200',
  'emerald-300': 'slate-300',
  'emerald-400': 'slate-400',
  'emerald-500': 'primary',
  'emerald-600': 'primary-container',
  'emerald-700': 'slate-700',
  'emerald-800': 'slate-800',
  'emerald-900': 'slate-900',
  
  'green-50': 'slate-50',
  'green-100': 'slate-100',
  'green-200': 'slate-200',
  'green-300': 'slate-300',
  'green-400': 'slate-400',
  'green-500': 'primary',
  'green-600': 'primary-container',
  'green-700': 'slate-700',
  'green-800': 'slate-800',
  'green-900': 'slate-900',

  'teal-50': 'slate-50',
  'teal-100': 'slate-100',
  'teal-200': 'slate-200',
  'teal-300': 'slate-300',
  'teal-400': 'slate-400',
  'teal-500': 'primary',
  'teal-600': 'primary-container',
  'teal-700': 'slate-700',
  'teal-800': 'slate-800',
  'teal-900': 'slate-900',

  // Amber / Orange / Yellow (Secondary equivalents)
  'amber-50': 'slate-50',
  'amber-100': 'slate-100',
  'amber-200': 'slate-200',
  'amber-300': 'slate-300',
  'amber-400': 'slate-400',
  'amber-500': 'secondary',
  'amber-600': 'secondary',
  'amber-700': 'slate-700',
  'amber-800': 'slate-800',
  'amber-900': 'slate-900',

  'orange-50': 'slate-50',
  'orange-100': 'slate-100',
  'orange-200': 'slate-200',
  'orange-300': 'slate-300',
  'orange-400': 'slate-400',
  'orange-500': 'secondary',
  'orange-600': 'secondary',
  'orange-700': 'slate-700',
  'orange-800': 'slate-800',
  'orange-900': 'slate-900',

  'yellow-50': 'slate-50',
  'yellow-100': 'slate-100',
  'yellow-200': 'slate-200',
  'yellow-300': 'slate-300',
  'yellow-400': 'slate-400',
  'yellow-500': 'secondary',
  'yellow-600': 'secondary',
  'yellow-700': 'slate-700',
  'yellow-800': 'slate-800',
  'yellow-900': 'slate-900',
  
  // Also bright blue
  'blue-50': 'slate-50',
  'blue-100': 'slate-100',
  'blue-200': 'slate-200',
  'blue-300': 'slate-300',
  'blue-400': 'slate-400',
  'blue-500': 'primary',
  'blue-600': 'primary-container',
  'blue-700': 'slate-700',
  'blue-800': 'slate-800',
  'blue-900': 'slate-900',
};

function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      // Replace bg-color, text-color, border-color, from-color, to-color, via-color, ring-color, etc.
      // E.g. bg-emerald-500, hover:bg-amber-400, border-t-green-500
      
      const prefixes = [
        'bg-', 'text-', 'border-', 'from-', 'to-', 'via-', 'ring-', 
        'hover:bg-', 'hover:text-', 'hover:border-', 'focus:border-', 'focus:ring-',
        'border-t-', 'border-b-', 'border-l-', 'border-r-'
      ];
      
      for (const [legacy, replacement] of Object.entries(colorMap)) {
        for (const pfx of prefixes) {
          const searchPattern = new RegExp(pfx + legacy + '(?![0-9])', 'g');
          const replacePattern = pfx + replacement;
          if (searchPattern.test(content)) {
            content = content.replace(searchPattern, replacePattern);
            changed = true;
          }
        }
      }

      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated colors in ${fullPath}`);
      }
    }
  }
}

processDirectory(directory);
console.log('Color replacement complete.');
