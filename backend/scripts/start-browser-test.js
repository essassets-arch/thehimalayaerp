const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const env = Object.assign({}, process.env);
env.NODE_ENV = 'test';
env.PORT = '4000';

const frontEnvPath = path.resolve(__dirname, '../../frontend/.env.browser-test');
const frontEnvContent = fs.readFileSync(frontEnvPath, 'utf8');
frontEnvContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim().replace(/['"\r]/g, '');
});

const backEnvPath = path.resolve(__dirname, '../.env.browser-test');
if (fs.existsSync(backEnvPath)) {
  const backEnvContent = fs.readFileSync(backEnvPath, 'utf8');
  backEnvContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) env[match[1].trim()] = match[2].trim().replace(/['"\r]/g, '');
  });
}

console.log('[WRAPPER] Starting NestJS with DATABASE_URL:', env.DATABASE_URL);

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const child = spawn(npmCmd, ['run', 'start:prod'], {
  stdio: 'inherit',
  env,
  cwd: path.resolve(__dirname, '../'),
  shell: true
});

child.on('exit', code => process.exit(code));
