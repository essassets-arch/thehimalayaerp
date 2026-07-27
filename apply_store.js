const fs = require('fs');

const original = fs.readFileSync('./store/erpStore.ts', 'utf8');
const newPart = fs.readFileSync('./store/new_procurement_store.ts', 'utf8');

const splitToken = '// 1. QC APPROVAL';
const parts = original.split(splitToken);

if (parts.length < 2) {
  console.error("Could not find split token");
  process.exit(1);
}

const finalFile = newPart + '\n  ' + splitToken + parts.slice(1).join(splitToken);

fs.writeFileSync('./store/erpStore.ts', finalFile);
console.log("Successfully updated erpStore.ts!");
