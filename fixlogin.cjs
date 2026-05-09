const fs = require('fs');
let c = fs.readFileSync('src/pages/LoginPage.tsx', 'utf8');
c = c.replace(
    "if (error) setError(error)",
    "if (error) setError(error.includes('Database') || error.includes('unexpected') ? 'Erro ao criar conta. Tente outro email ou senha mais forte.' : error)"
);
fs.writeFileSync('src/pages/LoginPage.tsx', c, 'utf8');
console.log('✅ Erro corrigido!');
