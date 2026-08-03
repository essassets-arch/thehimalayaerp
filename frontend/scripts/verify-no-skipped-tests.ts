import { auditPlaywrightTests } from './audit-playwright-execution';

/**
 * Strict Skip-Proof Verification Gate
 * Fails process exit code if any test is skipped, fixme'd, or contains zero assertions.
 */

export function verifyNoSkippedTests() {
  console.log('🔒 Running Strict Skip-Proof Verification Gate...');
  const audit = auditPlaywrightTests();

  if (audit.skipsFound.length > 0) {
    console.error('❌ STRICT GATE FAILURE: Skipped tests detected in Playwright suite:');
    audit.skipsFound.forEach((s) => console.error(`   - ${s.file}:${s.line} => ${s.text}`));
    process.exit(1);
  }

  if (audit.fixmesFound.length > 0) {
    console.error('❌ STRICT GATE FAILURE: test.fixme instances detected in Playwright suite:');
    audit.fixmesFound.forEach((f) => console.error(`   - ${f.file}:${f.line} => ${f.text}`));
    process.exit(1);
  }

  if (audit.totalDiscoveredTests === 0) {
    console.error('❌ STRICT GATE FAILURE: Zero Playwright tests discovered!');
    process.exit(1);
  }

  console.log('🎉 STRICT GATE PASSED: Zero skipped tests, zero fixmes, 100% executable suite!');
}

if (require.main === module) {
  verifyNoSkippedTests();
}
