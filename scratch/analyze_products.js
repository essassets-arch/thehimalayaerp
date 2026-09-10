const fs = require('fs');

const matches = JSON.parse(fs.readFileSync('scratch/parsed_matches.json', 'utf8'));

console.log('Total items in raw matches:', matches.length);

const uniqueNames = new Set(matches);
console.log('Total unique names as pasted:', uniqueNames.size);

// Check duplicate occurrences
const counts = {};
matches.forEach(name => {
  counts[name] = (counts[name] || 0) + 1;
});

const duplicates = Object.entries(counts).filter(([name, c]) => c > 1);
console.log('Duplicates count:', duplicates.length);
duplicates.forEach(([name, c]) => console.log(`  "${name}": ${c} times`));

// Check typos like HIMLAYA
const typos = matches.filter(m => m.startsWith('HIMLAYA '));
console.log('Typo "HIMLAYA" count:', typos.length);
typos.forEach(t => console.log('  Typo:', t));
