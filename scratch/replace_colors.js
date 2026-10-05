const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let newContent = content.replace(/var\(--secondary\)/g, 'var(--accent-success)');
      newContent = newContent.replace(/rgba\(46, 125, 50/g, 'rgba(0, 196, 180');
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent);
        console.log('Updated ' + fullPath);
      }
    }
  }
}

replaceInDir('d:/Gas Analzyer/frontend/src');
