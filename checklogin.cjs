const fs = require('fs');
let c = fs.readFileSync('src/pages/LoginPage.tsx', 'utf8');
const idx = c.indexOf("mode === 'login'");
console.log('Contexto exato:');
console.log(JSON.stringify(c.substring(idx-5, idx+200)));
