const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '../..');
const frontendDir = path.resolve(__dirname, '..');
const docsDir = path.join(rootDir, 'docs/phase-f');
const logsDir = path.join(docsDir, 'logs');

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

function parseTestOutput(text) {
  let passedTests = 0;
  let failedTests = 0;
  let totalTests = 0;

  const testMatch = text.match(/(\d+)\s+passed/i);
  if (testMatch) passedTests = parseInt(testMatch[1], 10);

  const failMatch = text.match(/(\d+)\s+failed/i);
  if (failMatch) failedTests = parseInt(failMatch[1], 10);

  totalTests = passedTests + failedTests;
  return { passedTests, failedTests, totalTests };
}

function runGate(gateId, name, command, cwd = frontendDir) {
  return new Promise((resolve) => {
    const startTime = new Date().toISOString();
    const startMs = Date.now();
    console.log(`\n==================================================`);
    console.log(`🚀 RUNNING FRONTEND GATE [${gateId}] ${name}`);
    console.log(`   Command: ${command}`);
    console.log(`   Cwd: ${cwd}`);
    console.log(`==================================================`);

    const child = exec(command, { cwd, maxBuffer: 10 * 1024 * 1024, env: { ...process.env, NODE_ENV: 'test' } }, (error, stdout, stderr) => {
      const endTime = new Date().toISOString();
      const durationMs = Date.now() - startMs;
      const exitCode = error ? (error.code || 1) : 0;
      const status = exitCode === 0 ? 'VERIFIED' : 'FAILED';

      const combinedText = `${stdout}\n${stderr}`;
      const parsedMetrics = parseTestOutput(combinedText);

      const logFileName = `gate-${gateId.toLowerCase().replace(/[^a-z0-9]/g, '-')}.log`;
      const logFilePath = path.join(logsDir, logFileName);
      const relativeLogPath = path.relative(rootDir, logFilePath).replace(/\\/g, '/');

      const logContent = `==================================================
GATE ID: ${gateId}
NAME: ${name}
COMMAND: ${command}
CWD: ${cwd}
START TIME: ${startTime}
END TIME: ${endTime}
DURATION: ${durationMs} ms
EXIT CODE: ${exitCode}
STATUS: ${status}
PASSED TESTS: ${parsedMetrics.passedTests}
FAILED TESTS: ${parsedMetrics.failedTests}
TOTAL TESTS: ${parsedMetrics.totalTests}
==================================================

--- STDOUT ---
${stdout}

--- STDERR ---
${stderr}
`;

      fs.writeFileSync(logFilePath, logContent);

      console.log(`🏁 GATE [${gateId}] COMPLETED in ${(durationMs / 1000).toFixed(2)}s`);
      console.log(`   Status: ${status} (Exit Code: ${exitCode})`);
      console.log(`   Log: ${relativeLogPath}`);

      resolve({
        gateId,
        name,
        command,
        cwd,
        startTime,
        endTime,
        durationMs,
        exitCode,
        status,
        ...parsedMetrics,
        logFile: relativeLogPath,
      });
    });
  });
}

async function runAllGates() {
  const gates = [
    { id: 'FRONTEND_LINT', name: 'Frontend ESLint', cmd: 'npm run lint' },
    { id: 'FRONTEND_TYPECHECK', name: 'Frontend TypeScript Typecheck', cmd: 'npx tsc --noEmit' },
    { id: 'FRONTEND_BUILD', name: 'Next.js Production Build', cmd: 'npm run build' },
  ];

  const results = [];
  for (const g of gates) {
    const res = await runGate(g.id, g.name, g.cmd);
    results.push(res);
  }

  const summaryPath = path.join(docsDir, 'final-results.json');
  fs.writeFileSync(summaryPath, JSON.stringify(results, null, 2));

  console.log(`\n==================================================`);
  console.log(`📊 ALL FRONTEND GATES EXECUTED. RESULTS SAVED TO: ${path.relative(rootDir, summaryPath)}`);
  console.log(`==================================================\n`);
  return results;
}

if (require.main === module) {
  runAllGates();
}

module.exports = { runGate, runAllGates };
