const fs = require('fs');
const path = require('path');

const srcDir = path.join('c:/Users/vanshika/Downloads/hrm_portal (1)/hrm_portal/hrm-frontend/src');

const endpoints = new Set();
function findAxios(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      findAxios(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('axios.get') || line.includes('axios.post') || line.includes('axios.put') || line.includes('axios.delete')) {
           const match = line.match(/axios\.(get|post|put|delete)\(([^,]+)/);
           if (match) {
             endpoints.add(`${match[1].toUpperCase()} ${match[2].trim()} (File: ${path.basename(fullPath)})`);
           }
        }
      }
    }
  }
}
findAxios(srcDir);
console.log(Array.from(endpoints).join('\n'));
