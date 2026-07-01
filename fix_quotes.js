const fs = require('fs');
const path = require('path');

const srcDir = path.join('c:/Users/vanshika/Downloads/hrm_portal (1)/hrm_portal/hrm-frontend/src');

function fixQuotes(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      fixQuotes(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Match pattern:
      // `${import.meta.env.VITE_API_URL || "https://hrm-backend-vvqg.onrender.com"}/api/something"
      // Replace with:
      // `${import.meta.env.VITE_API_URL || "https://hrm-backend-vvqg.onrender.com"}/api/something`
      
      const regex = /`\$\{import\.meta\.env\.VITE_API_URL \|\| "https:\/\/hrm-backend-vvqg\.onrender\.com"\}\/api([^"`\n]*)"/g;
      
      if (regex.test(content)) {
        content = content.replace(regex, '`${import.meta.env.VITE_API_URL || "https://hrm-backend-vvqg.onrender.com"}/api$1`');
        fs.writeFileSync(fullPath, content);
        console.log('Fixed quotes in:', fullPath);
      }
    }
  }
}

fixQuotes(srcDir);
