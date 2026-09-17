const fs = require('fs');

const rawPrompt = fs.readFileSync(__dirname + '/raw_prompt.txt', 'utf8');

console.log('Raw prompt length:', rawPrompt.length);
