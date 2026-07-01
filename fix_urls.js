const fs = require('fs');
const path = require('path');

const srcDir = path.join('c:/Users/vanshika/Downloads/hrm_portal (1)/hrm_portal/hrm-frontend/src');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      
      const targetStr = '"https://hrm-backend-vvqg.onrender.com';
      if (content.includes(targetStr)) {
        // Many files already have: const API = import.meta.env.VITE_API_URL || "https://hrm-backend-vvqg.onrender.com";
        // Let's only replace inside axios.get/post etc.
        // Or better, just replace all "https://hrm-backend-vvqg.onrender.com" with (import.meta.env.VITE_API_URL || "https://hrm-backend-vvqg.onrender.com")
        // But we have to be careful not to nest it.
        
        // A safer regex replacement:
        const newStr = '`${import.meta.env.VITE_API_URL || "https://hrm-backend-vvqg.onrender.com"}`';
        const newStrApi = '`${import.meta.env.VITE_API_URL || "https://hrm-backend-vvqg.onrender.com"}/api';
        
        // Replace exact string matches that are not already preceded by ||
        content = content.replace(/"https:\/\/hrm-backend-vvqg\.onrender\.com\/api/g, newStrApi);
        content = content.replace(/`https:\/\/hrm-backend-vvqg\.onrender\.com\/api/g, newStrApi);
        changed = true;
      }

      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log('Updated:', fullPath);
      }
    }
  }
}

replaceInDir(srcDir);
