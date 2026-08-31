const fs = require('fs');
const code = fs.readFileSync('scripts/clean_ss1_test.js', 'utf8');
const b64 = Buffer.from(code).toString('base64');
console.log(b64);
