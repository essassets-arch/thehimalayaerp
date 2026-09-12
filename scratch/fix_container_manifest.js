const { execSync } = require('child_process');

// 1. Read /app/.next/routes-manifest.json from container
const raw = execSync('docker exec himalaya-frontend cat /app/.next/routes-manifest.json').toString();
console.log('Matches for 127.0.0.1:4000:', (raw.match(/127\.0\.0\.1:4000/g) || []).length);

// 2. Replace 127.0.0.1:4000 with backend:4000
const fixed = raw.replace(/127\.0\.0\.1:4000/g, 'backend:4000');

const fs = require('fs');
fs.writeFileSync('scratch/routes-manifest-fixed.json', fixed);

// 3. Copy fixed routes-manifest back into container
execSync('docker cp scratch/routes-manifest-fixed.json himalaya-frontend:/app/.next/routes-manifest.json');
console.log('Replaced /app/.next/routes-manifest.json with backend:4000!');

// Also fix in frontend/.next/standalone/.next/routes-manifest.json if present
try {
  execSync('docker cp scratch/routes-manifest-fixed.json himalaya-frontend:/app/.next/standalone/.next/routes-manifest.json');
} catch (e) {}

// Restart himalaya-frontend
execSync('docker restart himalaya-frontend');
console.log('Restarted himalaya-frontend container!');
