const { execSync } = require('child_process');
const fs = require('fs');

function runCommand(command, cwd) {
  try {
    console.log(`Running ${command} in ${cwd}...`);
    const output = execSync(command, { cwd, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
    return { success: true, output };
  } catch (error) {
    return { success: false, output: error.stdout + '\n' + error.stderr };
  }
}

const results = {};

results.frontendLint = runCommand('npm run lint', 'd:\\prototype-next-main\\frontend');
results.frontendTypeCheck = runCommand('npm run type-check', 'd:\\prototype-next-main\\frontend');
results.backendLint = runCommand('npm run lint', 'd:\\prototype-next-main\\backend');
results.backendTypeCheck = runCommand('npm run type-check', 'd:\\prototype-next-main\\backend');

fs.writeFileSync('d:\\prototype-next-main\\scratch\\quality_audit.json', JSON.stringify(results, null, 2));
console.log('Quality audit complete.');
