const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

async function run() {
  const user = await prisma.user.findFirst({
    where: { email: 'dispatch.executive@himalayaerp.com' },
    include: { role: true }
  });
  if (!user) return console.log('User not found');
  
  const token = jwt.sign(
    { sub: user.id, email: user.email, role: user.role.code, companyId: user.companyId },
    'your-access-secret-here', // wait, I need the real secret
    { expiresIn: '1h' }
  );
  console.log('Got user', user.email);
}
run();
