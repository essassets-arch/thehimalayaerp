import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl || !dbUrl.includes('test')) {
  console.error(
    '\x1b[31m%s\x1b[0m',
    'FATAL ERROR: DATABASE_URL does not contain "test".',
  );
  console.error(
    '\x1b[31m%s\x1b[0m',
    'Aborting test execution to prevent damage to production/dev database.',
  );
  process.exit(1);
}
