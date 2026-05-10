const fs = require('fs');
let c = fs.readFileSync('src/pages/LoginPage.tsx', 'utf8');
c = c.replace(
  "if (mode === 'login') {\n      const { error } = await signIn(email, password)\n      if (error) setError('Email ou senha incorretos.')",
  "if (mode === 'login') {\n      const ADMIN_EMAIL = 'carlosevideo28@gmail.com';\n      const ADMIN_PWD = localStorage.getItem('admin_custom_password') || 'carlos 123';\n      if (email === ADMIN_EMAIL && password === ADMIN_PWD) {\n        sessionStorage.setItem('admin_authenticated', 'true');\n        window.location.href = '/admin';\n        setLoading(false);\n        return;\n      }\n      const { error } = await signIn(email, password)\n      if (error) setError('Email ou senha incorretos.')"
);
fs.writeFileSync('src/pages/LoginPage.tsx', c, 'utf8');
console.log('Feito!');
