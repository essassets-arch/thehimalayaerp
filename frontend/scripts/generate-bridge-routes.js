const fs = require('fs');
const path = require('path');

const routes = [
  { dir: 'sales/orders', file: 'route.ts', createPost: true, pathSuffix: '' },
  { dir: 'sales/orders/from-quotation', file: 'route.ts', createPost: true, pathSuffix: '/from-quotation' },
  { dir: 'sales/orders/[id]/customer-po', file: 'route.ts', createPost: true, pathSuffix: '/[id]/customer-po' },
  { dir: 'sales/orders/[id]/credit-check', file: 'route.ts', createPost: true, pathSuffix: '/[id]/credit-check' },
  { dir: 'sales/orders/[id]/credit-exception/approve', file: 'route.ts', createPost: true, pathSuffix: '/[id]/credit-exception/approve' },
  { dir: 'sales/orders/[id]/confirm', file: 'route.ts', createPost: true, pathSuffix: '/[id]/confirm' },
  { dir: 'sales/orders/[id]/send-to-plant-head', file: 'route.ts', createPost: true, pathSuffix: '/[id]/send-to-plant-head' },
  { dir: 'sales/orders/[id]/cancel', file: 'route.ts', createPost: true, pathSuffix: '/[id]/cancel' },
];

const baseDir = path.join(__dirname, '../app/api/backend');

routes.forEach(r => {
  const fullDir = path.join(baseDir, r.dir);
  if (!fs.existsSync(fullDir)) {
    fs.mkdirSync(fullDir, { recursive: true });
  }
  const fullPath = path.join(fullDir, r.file);

  let content = '';
  // For dynamic routes we need to replace [id] with ${params.id}
  let resolvedPath = `'/sales/orders'`;
  if (r.pathSuffix) {
    if (r.pathSuffix.includes('[id]')) {
      const parts = r.pathSuffix.split('[id]');
      resolvedPath = '"`/sales/orders/${params.id}' + parts[1] + '`"';
    } else {
      resolvedPath = `'/sales/orders${r.pathSuffix}'`;
    }
  }

  content = `import { NextRequest } from 'next/server';
import '@/lib/server/backendFeatureConfig';
import { forwardBackendRequest } from '@/lib/server/backendApiClient';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest${r.pathSuffix.includes('[id]') ? ', { params }: { params: { id: string } }' : ''}) {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader ? authHeader.split(' ')[1] : undefined;
  const idempotencyKey = request.headers.get('Idempotency-Key');

  const body = await request.json().catch(() => ({}));

  return forwardBackendRequest({
    token,
    path: ${resolvedPath},
    method: 'POST',
    body,
    headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
    requestId: request.headers.get('x-request-id') ?? undefined,
  });
}
`;

  if (r.dir === 'sales/orders') {
    // Preserve GET in sales/orders/route.ts
    const existing = fs.readFileSync(fullPath, 'utf8');
    if (!existing.includes('export async function POST')) {
      fs.writeFileSync(fullPath, existing + '\n' + content);
    }
  } else {
    fs.writeFileSync(fullPath, content);
  }
  console.log('Generated', fullPath);
});
