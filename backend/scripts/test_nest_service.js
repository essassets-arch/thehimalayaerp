const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/app.module');
const { DispatchService } = require('./dist/modules/dispatch/dispatch.service');

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dispatchService = app.get(DispatchService);
  
  // Test as DISPATCH_EXECUTIVE
  const dispatches = await dispatchService.listDispatches('userId-ignored', 'DISPATCH_EXECUTIVE');
  console.log('DISPATCH_EXECUTIVE gets count:', dispatches.length);
  
  // Test as SALES_EXECUTIVE
  const salesDispatches = await dispatchService.listDispatches('771024a5-43f5-457b-b90e-eec27a019c65', 'SALES_EXECUTIVE');
  console.log('SALES_EXECUTIVE (771024a5) gets count:', salesDispatches.length);

  await app.close();
}

bootstrap().catch(err => {
  console.error(err);
  process.exit(1);
});
