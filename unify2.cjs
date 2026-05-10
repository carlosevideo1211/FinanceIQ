const fs = require('fs');
let c = fs.readFileSync('src/pages/LoginPage.tsx', 'utf8');

const oldStr = if (mode === 'login') {
      const { error } = await signIn(email, password)
      if (error) setError('Email ou senha incorretos.');

const newStr = if (mode === 'login') {
        const ADMIN_EMAIL = 'carlosevideo28@gmail.com';
        const ADMIN_PWD = localStorage.getItem('admin_custom_password') || 'carlos 123';
        if (email === ADMIN_EMAIL && password === ADMIN_PWD) {
          sessionStorage.setItem('admin_authenticated', 'true');
          window.location.href = '/admin';
          setLoading(false);
          return;
        }
        const { error } = await signIn(email, password)
        if (error) setError('Email ou senha incorretos.');

if (c.includes(oldStr)) {
    c = c.replace(oldStr, newStr);
    fs.writeFileSync('src/pages/LoginPage.tsx', c, 'utf8');
    console.log('Feito!');
} else {
    console.log('Nao encontrado');
    console.log(c.substring(c.indexOf("mode === 'login'") - 10, c.indexOf("mode === 'login'") + 150));
}
