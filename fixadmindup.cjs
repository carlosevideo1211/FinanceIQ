const fs = require('fs');
let c = fs.readFileSync('src/pages/AdminLoginPage.tsx', 'utf8');

// Count occurrences of resetMode declaration
const count = (c.match(/const \[resetMode/g) || []).length;
console.log('resetMode declarations:', count);

// If duplicated, keep only the last version by rebuilding the file
const lines = c.split('\n');
const seen = new Set();
const filtered = [];
for (const line of lines) {
  const isDuplicate = 
    (line.includes("const [resetMode") || 
     line.includes("const [newPassword") || 
     line.includes("const [confirmPassword") || 
     line.includes("const [success")) && 
    seen.has(line.trim());
  if (!isDuplicate) {
    filtered.push(line);
    if (line.includes("useState")) seen.add(line.trim());
  }
}
fs.writeFileSync('src/pages/AdminLoginPage.tsx', filtered.join('\n'), 'utf8');
console.log('Linhas originais:', lines.length);
console.log('Linhas após limpeza:', filtered.length);
