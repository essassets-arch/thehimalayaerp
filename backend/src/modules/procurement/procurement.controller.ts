import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  UseGuards,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { ProcurementService } from './procurement.service';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { ProcurementClosureService } from './procurement-closure.service';
import { POReportService } from './po-report.service';
import { MaterialRejectionService } from './material-rejection.service';
@Controller('procurement')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ProcurementController {
  constructor(
    private readonly service: ProcurementService,
    private readonly closure: ProcurementClosureService,
    private readonly poReportService: POReportService,
    private readonly rejectionService: MaterialRejectionService,
  ) {}
  @Get('indents') @RequirePermissions('procurement.indents.read') listIndents(
    @Query() q: any,
    @Req() r: any,
  ) {
    return this.service.list(
      'purchaseIndent',
      q,
      r.user?.sub,
      r.user?.role,
      r.user?.companyId,
    );
  }
  /** Store's low-stock worklist. `minimumStock` is supplied by the material master/UI. */
  @RequirePermissions('procurement.procurement.read')
  @Get('low-stock-alerts')
  @Roles('STORE', 'STORE_MANAGER', 'PLANT_HEAD', 'ADMIN', 'SUPER_ADMIN', 'FINANCE', 'FINANCE_MANAGER', 'PURCHASE_MANAGER', 'PRODUCTION_MANAGER')
  lowStock(@Req() r: any, @Query() q: any) {
    return this.service.lowStock(r.user?.companyId, q);
  }
  @RequirePermissions('procurement.procurement.read')
  @Get('store/indent-history')
  @Roles('STORE', 'STORE_MANAGER', 'PLANT_HEAD', 'ADMIN', 'SUPER_ADMIN', 'FINANCE', 'FINANCE_MANAGER', 'PURCHASE_MANAGER', 'PRODUCTION_MANAGER')
  indentHistoryList(@Req() r: any, @Query() q: any) {
    return this.service.indentHistoryList(r.user?.companyId, q);
  }
  @RequirePermissions('procurement.procurement.read')
  @Get('plant-head/material-indents')
  @Roles('PLANT_HEAD', 'PLANT_HEAD_MANAGER', 'STORE', 'STORE_MANAGER', 'ADMIN', 'SUPER_ADMIN', 'FINANCE', 'FINANCE_MANAGER', 'PURCHASE_MANAGER')
  plantHeadQueue(@Req() r: any, @Query() q: any) {
    return this.service.indentQueue(r.user?.companyId, q);
  }
  @RequirePermissions('procurement.procurement.read')
  @Get('finance/po-requests')
  @Roles('FINANCE', 'FINANCE_EXECUTIVE', 'FINANCE_MANAGER', 'STORE', 'STORE_MANAGER', 'PLANT_HEAD', 'ADMIN', 'SUPER_ADMIN', 'PURCHASE_MANAGER')
  financeQueue(@Req() r: any, @Query() q: any) {
    return this.service.purchaseOrderQueue(r.user?.companyId, q);
  }
  @RequirePermissions('procurement.procurement.read')
  @Get('super-admin/po-requests')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE', 'FINANCE_MANAGER', 'PLANT_HEAD', 'STORE', 'STORE_MANAGER')
  adminQueue(@Req() r: any, @Query() q: any) {
    return this.service.purchaseOrderQueue(r.user?.companyId, {
      ...q,
      status: 'PENDING_SUPER_ADMIN_APPROVAL',
    });
  }
  @Post('indents')
  @RequirePermissions('procurement.indents.create')
  createIndent(@Body() d: any, @Req() r: any) {
    return this.service.createIndent(d, r.user?.sub);
  }
  @Post('indents/:id/:action')
  @RequirePermissions('procurement.indents.update')
  indentAction(
    @Param('id') id: string,
    @Param('action') a: string,
    @Body() d: any,
    @Req() r: any,
  ) {
    const overrideSod =
      r.user?.role === 'SUPER_ADMIN' ||
      Boolean(r.user?.permissions?.includes('procurement.indents.override'));
    return this.service.indentAction(id, a, d, r.user?.sub, overrideSod);
  }
  @Get('indents/:id/history')
  @RequirePermissions('procurement.indents.read')
  indentHistory(@Param('id') id: string) {
    return this.service.history('PurchaseIndent', id);
  }
  @Get('purchase-orders')
  @RequirePermissions('procurement.purchase_orders.read')
  listPO(@Query() q: any, @Req() r: any) {
    return this.service.list(
      'purchaseOrder',
      q,
      r.user?.sub,
      r.user?.role,
      r.user?.companyId,
    );
  }
  @Post('purchase-orders/from-indent/:indentId')
  @RequirePermissions('procurement.purchase_orders.create')
  createPO(@Param('indentId') id: string, @Body() d: any, @Req() r: any) {
    return this.service.createPO(id, d, r.user?.sub);
  }
  @Get('purchase-orders/:id/closure-status')
  @RequirePermissions('procurement.purchase_orders.read')
  closureStatus(@Param('id') id: string) {
    return this.closure.evaluate(id);
  }
  @Post('purchase-orders/:id/evaluate-closure')
  @RequirePermissions('procurement.purchase_orders.read')
  evaluateClosure(@Param('id') id: string) {
    return this.closure.evaluate(id);
  }
  @Post('purchase-orders/:id/close')
  @RequirePermissions('procurement.purchase_orders.close')
  close(@Param('id') id: string, @Body() d: any, @Req() r: any) {
    return this.closure.close(id, r.user?.sub, d.reason);
  }
  @Post('purchase-orders/:id/:action')
  @RequirePermissions('procurement.purchase_orders.update')
  poAction(
    @Param('id') id: string,
    @Param('action') a: string,
    @Body() d: any,
    @Req() r: any,
  ) {
    const overrideSod =
      r.user?.role === 'SUPER_ADMIN' ||
      Boolean(r.user?.permissions?.includes('procurement.po.override'));
    return this.service.poAction(id, a, d, r.user?.sub, overrideSod);
  }
  @Get('purchase-orders/:id/history')
  @RequirePermissions('procurement.purchase_orders.read')
  poHistory(@Param('id') id: string) {
    return this.service.history('PurchaseOrder', id);
  }
  @Get('grns') @RequirePermissions('procurement.grns.read') listGrns(
    @Query() q: any,
    @Req() r: any,
  ) {
    return this.service.list(
      'goodsReceiptNote',
      q,
      r.user?.sub,
      r.user?.role,
      r.user?.companyId,
    );
  }
  @Post('grns') @RequirePermissions('procurement.grns.create') createGrn(
    @Body() d: any,
    @Req() r: any,
  ) {
    return this.service.createGrn(d, r.user?.sub);
  }
  @Post('grns/:id/:action')
  @RequirePermissions('procurement.grns.update')
  grnAction(
    @Param('id') id: string,
    @Param('action') a: string,
    @Body() d: any,
    @Req() r: any,
  ) {
    const overrideSod =
      r.user?.role === 'SUPER_ADMIN' ||
      Boolean(r.user?.permissions?.includes('procurement.grn.override'));
    return this.service.grnAction(id, a, d, r.user?.sub, overrideSod);
  }
  /** Verifies one partial/full delivery, posts accepted stock and creates its GRN atomically. Verified & updated. */
  @RequirePermissions('procurement.procurement.create')
  @Post('store/deliveries/verify')
  @Roles('STORE', 'STORE_MANAGER', 'PLANT_HEAD', 'ADMIN', 'SUPER_ADMIN', 'FINANCE', 'PURCHASE_MANAGER')
  verifyDelivery(@Body() d: any, @Req() r: any) {
    return this.service.verifyDelivery(d, r.user?.sub, r.user?.companyId);
  }
  @RequirePermissions('procurement.procurement.read')
  @Get('store/deliveries')
  @Roles('STORE', 'STORE_MANAGER', 'PLANT_HEAD', 'ADMIN', 'SUPER_ADMIN', 'FINANCE', 'PURCHASE_MANAGER')
  deliveries(@Req() r: any, @Query() q: any) {
    return this.service.deliveryHistory(
      r.user?.companyId,
      q,
      r.user?.sub,
      r.user?.role,
    );
  }
  @Get('grns/:id/history')
  @RequirePermissions('procurement.grns.read')
  grnHistory(@Param('id') id: string) {
    return this.service.history('GoodsReceiptNote', id);
  }
  @Get('vendor-invoices')
  @RequirePermissions('procurement.vendor_invoices.read')
  listInvoices(@Query() q: any, @Req() r: any) {
    return this.service.list(
      'vendorInvoice',
      q,
      r.user?.sub,
      r.user?.role,
      r.user?.companyId,
    );
  }
  @Post('vendor-invoices')
  @RequirePermissions('procurement.vendor_invoices.create')
  createInvoice(@Body() d: any, @Req() r: any) {
    return this.service.createInvoice(d, r.user?.sub);
  }
  @Post('vendor-invoices/:id/:action')
  @RequirePermissions('procurement.vendor_invoices.update')
  invoiceAction(
    @Param('id') id: string,
    @Param('action') a: string,
    @Body() d: any,
    @Req() r: any,
  ) {
    const overrideSod =
      r.user?.role === 'SUPER_ADMIN' ||
      Boolean(r.user?.permissions?.includes('finance.invoices.override'));
    return this.service.invoiceAction(id, a, d, r.user?.sub, overrideSod);
  }
  @Get('vendor-invoices/:id/history')
  @RequirePermissions('procurement.vendor_invoices.read')
  invoiceHistory(@Param('id') id: string) {
    return this.service.history('VendorInvoice', id);
  }
  @Get('vendor-payments')
  @RequirePermissions('procurement.vendor_payments.read')
  listPayments(@Query() q: any, @Req() r: any) {
    return this.service.list(
      'vendorPayment',
      q,
      r.user?.sub,
      r.user?.role,
      r.user?.companyId,
    );
  }
  @Post('vendor-payments')
  @RequirePermissions('procurement.vendor_payments.create')
  createPayment(@Body() d: any, @Req() r: any) {
    return this.service.createPayment(d, r.user?.sub);
  }
  @Post('vendor-payments/:id/:action')
  @RequirePermissions('procurement.vendor_payments.update')
  paymentAction(
    @Param('id') id: string,
    @Param('action') a: string,
    @Body() d: any,
    @Req() r: any,
  ) {
    const overrideSod =
      r.user?.role === 'SUPER_ADMIN' ||
      Boolean(r.user?.permissions?.includes('finance.payments.override'));
    return this.service.paymentAction(id, a, d, r.user?.sub, overrideSod);
  }
  @Get('vendor-payments/:id/history')
  @RequirePermissions('procurement.vendor_payments.read')
  paymentHistory(@Param('id') id: string) {
    return this.service.history('VendorPayment', id);
  }

  @RequirePermissions('procurement.procurement.read')
  @Get('reports/po')
  @Roles('STORE', 'STORE_MANAGER', 'FINANCE', 'FINANCE_MANAGER', 'PLANT_HEAD', 'ADMIN', 'SUPER_ADMIN', 'PURCHASE_MANAGER', 'PRODUCTION_MANAGER')
  getPOReport(@Req() r: any) {
    return this.poReportService.getPOReport(r.user?.companyId);
  }

  @RequirePermissions('procurement.procurement.read')
  @Get('material-rejections')
  @Roles('STORE', 'FINANCE', 'STORE_MANAGER', 'FINANCE_MANAGER', 'PLANT_HEAD', 'ADMIN', 'SUPER_ADMIN', 'PURCHASE_MANAGER', 'PRODUCTION_MANAGER', 'QUALITY_MANAGER')
  listRejections(@Req() r: any) {
    return this.rejectionService.list(r.user?.companyId);
  }
  @RequirePermissions('procurement.procurement.read')
  @Get('material-rejections/:id')
  @Roles('STORE', 'FINANCE', 'STORE_MANAGER', 'FINANCE_MANAGER', 'PLANT_HEAD', 'ADMIN', 'SUPER_ADMIN', 'PURCHASE_MANAGER', 'PRODUCTION_MANAGER', 'QUALITY_MANAGER')
  getRejection(@Param('id') id: string) {
    return this.rejectionService.getById(id);
  }
  @RequirePermissions('procurement.procurement.create')
  @Post('material-rejections')
  @Roles('STORE', 'STORE_MANAGER')
  createRejection(@Body() d: any, @Req() r: any) {
    return this.rejectionService.create(r.user?.companyId, d, r.user?.sub);
  }
  @RequirePermissions('procurement.procurement.reject')
  @Post('material-rejections/:id/:action')
  @Roles('FINANCE', 'FINANCE_MANAGER', 'SUPER_ADMIN')
  rejectionAction(
    @Param('id') id: string,
    @Param('action') a: string,
    @Body() d: any,
    @Req() r: any,
  ) {
    return this.rejectionService.action(id, a, d, r.user?.sub);
  }
}
