const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  let entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    let srcPath = path.join(src, entry.name);
    let destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

const srcClient = path.join(__dirname, '..', '..', 'node_modules', '@prisma', 'client');
const destClient = path.join(__dirname, '..', 'node_modules', '@prisma', 'client');
const srcDotPrisma = path.join(__dirname, '..', '..', 'node_modules', '.prisma');
const destDotPrisma = path.join(__dirname, '..', 'node_modules', '.prisma');

console.log("Syncing @prisma/client from " + srcClient + " to " + destClient + "...");
copyDir(srcClient, destClient);

console.log("Syncing .prisma from " + srcDotPrisma + " to " + destDotPrisma + "...");
copyDir(srcDotPrisma, destDotPrisma);

console.log('Prisma sync complete!');
