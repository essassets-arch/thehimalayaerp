require('dotenv').config({ path: 'backend/.env' });
const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');

const pgDumpPath = 'C:\\Program Files\\PostgreSQL\\18\\bin\\pg_dump.exe';
const backupFile = path.resolve('backups', 'himalaya_erp_backup_pre_route_tracking_20260923.sql');

console.log('Initiating database backup to:', backupFile);

let dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('DATABASE_URL is not set.');
  process.exit(1);
}

// Strip query parameters for pg_dump compatibility
dbUrl = dbUrl.split('?')[0];

execFile(pgDumpPath, ['-d', dbUrl, '-F', 'p', '-f', backupFile], (err, stdout, stderr) => {
  if (err) {
    console.error('Backup failed:', err.message);
    if (stderr) console.error('Stderr:', stderr);
    process.exit(1);
  }
  const stats = fs.statSync(backupFile);
  console.log('✓ Backup successfully created!');
  console.log('Backup file size:', (stats.size / 1024 / 1024).toFixed(2), 'MB');
  console.log('Timestamp:', stats.mtime.toISOString());
});
