const fs = require('fs');
const path = require('path');

const buf = fs.readFileSync(path.resolve(__dirname, '../store (2) (1).csv'));
// Try utf8
const utf8Str = buf.toString('utf8');
// Try latin1 / win1252
const latin1Str = buf.toString('latin1');

const utf8Matches = utf8Str.split('\n').filter(l => l.includes('') || l.includes('?'));
console.log('UTF-8 strange chars (sample 5):', utf8Matches.slice(0, 5));

const latin1Matches = latin1Str.split('\n').filter(l => l.includes('–') || l.includes('—') || l.includes('½') || l.includes('¼') || l.includes('·') || l.includes('²') || l.includes('³'));
console.log('Latin1 clean chars (sample 5):', latin1Matches.slice(0, 5));
