import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import configuration from './config/configuration';
import { validate } from './config/env.validation';
import { PrismaModule } from './database/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AuditModule } from './modules/audit/audit.module';
import { HealthModule } from './modules/health/health.module';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { IdempotencyInterceptor } from './common/interceptors/idempotency.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { CustomersModule } from './modules/customers/customers.module';
import { SalesModule } from './modules/sales/sales.module';
import { SequenceModule } from './common/sequence/sequence.module';
import { CustomerComplaintsModule } from './modules/customer-complaints/customer-complaints.module';
import { SalesReturnsModule } from './modules/sales-returns/sales-returns.module';
import { ReplacementsModule } from './modules/replacements/replacements.module';
import { CrmModule } from './modules/crm/crm.module';
import { QuotationsModule } from './modules/quotations/quotations.module';
import { SamplesModule } from './modules/samples/samples.module';
import { ProductsModule } from './modules/products/products.module';
import { WarehousesModule } from './modules/warehouses/warehouses.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { ProcurementModule } from './modules/procurement/procurement.module';
import { FinanceModule } from './modules/finance/finance.module';
import { WorkflowModule } from './modules/workflow/workflow.module';
import { AttachmentsModule } from './modules/attachments/attachments.module';
import { CommentsModule } from './modules/comments/comments.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ProductionModule } from './modules/production/production.module';
import { WorkOrdersModule } from './modules/work-orders/work-orders.module';
import { QcModule } from './modules/qc/qc.module';
import { DispatchModule } from './modules/dispatch/dispatch.module';
import { MaterialRequestsModule } from './modules/material-requests/material-requests.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RecruitmentModule } from './modules/recruitment/recruitment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    AuditModule,
    HealthModule,
    CustomersModule,
    SalesModule,
    SequenceModule,
    CustomerComplaintsModule,
    SalesReturnsModule,
    ReplacementsModule,
    CrmModule,
    QuotationsModule,
    SamplesModule,
    ProductsModule,
    WarehousesModule,
    InventoryModule,
    SuppliersModule,
    ProcurementModule,
    FinanceModule,
    WorkflowModule,
    AttachmentsModule,
    CommentsModule,
    NotificationsModule,
    ProductionModule,
    WorkOrdersModule,
    QcModule,
    DispatchModule,
    MaterialRequestsModule,
    RecruitmentModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // Secured by default
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: IdempotencyInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
