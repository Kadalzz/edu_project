const bcrypt = require('bcryptjs');

const password = process.argv[2] || 'admin123';
const hash = bcrypt.hashSync(password, 10);

console.log('\n=================================');
console.log('Password:', password);
console.log('Hash:', hash);
console.log('=================================\n');
console.log('Copy hash di atas untuk insert ke database');
