const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', '..', 'backend', 'prisma', 'schema.prisma');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

let print = false;
lines.forEach((line, idx) => {
  if (line.trim().startsWith('model SalesOrderItem ')) {
    print = true;
  }
  if (print) {
    console.log(`${idx + 1}: ${line}`);
    if (line.trim() === '}') {
      print = false;
    }
  }
});
