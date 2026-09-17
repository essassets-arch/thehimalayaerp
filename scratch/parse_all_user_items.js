const fs = require('fs');

const raw = fs.readFileSync(__dirname + '/raw_full_user_request.txt', 'utf8');

// Regex to identify starting points of products
// e.g., optional leading number like "1 ", then HIMALAYA or HIMLAYA, then FRP, then TYPE (WGC|MHC|ONGC|RCS)
const productRegex = /(?:^|\s+)(?:(\d+)\s+)?(HIMALAYA|HIMLAYA)\s+FRP\s+(WGC|MHC|ONGC|RCS)\s+([^\t\n\r]+?)(?=\s+(?:HIMALAYA|HIMLAYA)\s+MFG|\s+MFG)/gi;

// Let's test how many matches we find and inspect each match
const matches = [];
let match;

// We also need to capture the numeric columns (COVER, FRAME, SET) following HIMALAYA MFG
// Let's write a parser that tokenizes or regexes each full row:
// (HIMALAYA FRP ...) \t* HIMALAYA \t* MFG \t* (\d+) \t* (\d+) (\t* \d+)?

const fullRowRegex = /(?:(\d+)\s+)?(HIMA?LAYA\s+FRP\s+(?:WGC|MHC|ONGC|RCS)\s+[A-Z0-9X\s\.-]+?)\s+(?:HIMA?LAYA\s+)?MFG\s+(\d+)\s+(\d+)(?:\s+(\d+))?/gi;

const found = [];
let m;
while ((m = fullRowRegex.exec(raw)) !== null) {
  let [_, strayNum, rawName, col1, col2, col3] = m;
  rawName = rawName.trim().replace(/\s+/g, ' ');
  found.push({
    strayNum,
    name: rawName,
    col1: parseInt(col1, 10),
    col2: parseInt(col2, 10),
    col3: col3 !== undefined ? parseInt(col3, 10) : null
  });
}

console.log('Total extracted products:', found.length);
console.log('First 5:', found.slice(0, 5));
console.log('Last 5:', found.slice(-5));

// Check types breakdown
const typeCounts = {};
found.forEach(p => {
  const t = p.name.split(' ')[2];
  typeCounts[t] = (typeCounts[t] || 0) + 1;
});
console.log('Type breakdown:', typeCounts);
