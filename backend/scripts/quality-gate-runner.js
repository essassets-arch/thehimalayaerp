const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '../..');
const backendDir = path.resolve(__dirname, '..');
const docsDir = path.join(rootDir, 'docs/phase-e-plus');
const logsDir = path.join(docsDir, 'logs');

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

function parseTestOutput(text) {
  let passedTests = 0;
  let failedTests = 0;
  let totalTests = 0;
  let passedSuites = 0;
  let failedSuites = 0;
  let totalSuites = 0;

  const testMatch = text.match(/Tests:\s+(?:(\d+)\s+failed,\s+)?(?:(\d+)\s+passed,\s+)?(\d+)\s+total/);
  if (testMatch) {
    failedTests = testMatch[1] ? parseInt(testMatch[1], 10) : 0;
    passedTests = testMatch[2] ? parseInt(testMatch[2], 10) : (failedTests === 0 ? parseInt(testMatch[3], 10) : 0);
    totalTests = parseInt(testMatch[3], 10);
  }

  const suiteMatch = text.match(/Test Suites:\s+(?:(\d+)\s+failed,\s+)?(?:(\d+)\s+passed,\s+)?(\d+)\s+total/);
  if (suiteMatch) {
    failedSuites = suiteMatch[1] ? parseInt(suiteMatch[1], 10) : 0;
    passedSuites = suiteMatch[2] ? parseInt(suiteMatch[2], 10) : (failedSuites === 0 ? parseInt(suiteMatch[3], 10) : 0);
    totalSuites = parseInt(suiteMatch[3], 10);
  }

  return { passedTests, failedTests, totalTests, passedSuites, failedSuites, totalSuites };
}

function runGate(gateId, name, command, cwd = backendDir) {
  return new Promise((resolve) => {
    const startTime = new Date().toISOString();
    const startMs = Date.now();
    console.log(`\n==================================================`);
    console.log(`🚀 RUNNING GATE [${gateId}] ${name}`);
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
      console.log(`   Passed: ${parsedMetrics.passedTests}, Failed: ${parsedMetrics.failedTests}, Total: ${parsedMetrics.totalTests}`);
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
    { id: 'LINT_SECURITY', name: 'Security Core Lint', cmd: 'npx eslint src/common/guards/ src/common/types/security.types.ts' },
    { id: 'LINT_REPO', name: 'Full Backend Repository Lint', cmd: 'npm run lint' },
    { id: 'TYPECHECK', name: 'TypeScript Typecheck', cmd: 'npx tsc --noEmit' },
    { id: 'BUILD', name: 'Production Build', cmd: 'npm run build' },
    { id: 'UNIT_TESTS', name: 'Unit Tests Suite', cmd: 'npm test -- --runInBand' },
    { id: 'E2E_SECURITY', name: 'Security E2E Suite', cmd: 'npm run test:e2e:security' },
    { id: 'E2E_PROCUREMENT', name: 'Procurement Business E2E', cmd: 'npm run test:e2e:procurement' },
    { id: 'E2E_SALES', name: 'Sales Business E2E', cmd: 'npm run test:e2e:sales' },
    { id: 'E2E_PRODUCTION', name: 'Production Business E2E', cmd: 'npm run test:e2e:production' },
    { id: 'E2E_QC', name: 'QC Business E2E', cmd: 'npm run test:e2e:qc' },
    { id: 'E2E_DISPATCH', name: 'Dispatch Business E2E', cmd: 'npm run test:e2e:dispatch' },
    { id: 'E2E_FINANCE', name: 'Finance Business E2E', cmd: 'npm run test:e2e:finance' },
    { id: 'E2E_PAYROLL', name: 'Payroll Business E2E', cmd: 'npm run test:e2e:payroll' },
    { id: 'E2E_RECRUITMENT', name: 'Recruitment Business E2E', cmd: 'npm run test:e2e:recruitment' },
    { id: 'E2E_RETURNS', name: 'After-Sales Returns E2E', cmd: 'npm run test:e2e:returns' },
    { id: 'E2E_REPLACEMENTS', name: 'After-Sales Replacements E2E', cmd: 'npm run test:e2e:replacements' },
    { id: 'E2E_BRAND_ANALYSIS', name: 'Brand Analysis E2E', cmd: 'npm run test:e2e:brand-analysis' },
    { id: 'E2E_ALL', name: 'Full Combined E2E Suite', cmd: 'npm run test:e2e:all' },
    { id: 'PRISMA_VALIDATE', name: 'Prisma Schema Validation', cmd: 'npx prisma validate' },
    { id: 'PRISMA_MIGRATE_STATUS', name: 'Prisma Migration Status', cmd: 'npx prisma migrate status' },
    { id: 'PRISMA_SEED_PASS1', name: 'Database Seed (Pass 1)', cmd: 'npx prisma db seed' },
    { id: 'PRISMA_SEED_PASS2', name: 'Database Seed (Pass 2 - Idempotency)', cmd: 'npx prisma db seed' }
  ];

  const results = [];
  for (const g of gates) {
    const res = await runGate(g.id, g.name, g.cmd);
    results.push(res);
  }

  const summaryPath = path.join(docsDir, 'final-results.json');
  fs.writeFileSync(summaryPath, JSON.stringify(results, null, 2));

  // Generate 01-CORRECTED-RESULTS.md purely from parsed output
  const report = `# 01 — Corrected System Verification Matrix & Final Results

## 1. Overview & Verification Status

- **Runner Script**: [\`backend/scripts/quality-gate-runner.js\`](file:///d:/prototype-next-main/backend/scripts/quality-gate-runner.js)
- **Results Output**: [\`docs/phase-e-plus/final-results.json\`](file:///d:/prototype-next-main/docs/phase-e-plus/final-results.json)
- **Log Files**: [\`docs/phase-e-plus/logs/\`](file:///d:/prototype-next-main/docs/phase-e-plus/logs/)

---

## 2. Parsed Verification Results Table

| Gate ID | Gate Name | Command | Exit Code | Status | Passed Tests | Failed Tests | Total Tests | Duration |
| :--- | :--- | :--- | :---: | :---: | ---: | ---: | ---: | ---: |
${results.map((r) => `| **${r.gateId}** | ${r.name} | \`${r.command}\` | ${r.exitCode} | **${r.status}** | ${r.passedTests} | ${r.failedTests} | ${r.totalTests} | ${(r.durationMs / 1000).toFixed(2)}s |`).join('\n')}

---

## 3. Corrected Results Summary

- **Total Verification Gates**: \`${results.length}\`
- **Passed Gates**: \`${results.filter((r) => r.exitCode === 0).length}\`
- **Failed Gates**: \`${results.filter((r) => r.exitCode !== 0).length}\`
- **Total Test Cases Executed**: \`${results.reduce((acc, r) => acc + r.totalTests, 0)}\`
- **Total Passed Test Cases**: \`${results.reduce((acc, r) => acc + r.passedTests, 0)}\`
`;

  fs.writeFileSync(path.join(docsDir, '01-CORRECTED-RESULTS.md'), report);
  console.log(`\n==================================================`);
  console.log(`📊 ALL GATES EXECUTED. RESULTS SAVED TO: ${path.relative(rootDir, summaryPath)}`);
  console.log(`==================================================\n`);
  return results;
}

if (require.main === module) {
  runAllGates();
}

module.exports = { runGate, runAllGates };
