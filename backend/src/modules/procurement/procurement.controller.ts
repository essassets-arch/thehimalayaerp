import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { ProcurementService } from './procurement.service';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { ProcurementClosureService } from './procurement-closure.service';
import { POReportService } from './po-report.service';
import { MaterialRejectionService } from './material-rejection.service';
@Controller('procurement')
export class ProcurementController {
  constructor(
    private readonly service: ProcurementService,
    private readonly closure: ProcurementClosureService,
    private readonly poReportService: POReportService,
    private readonly rejectionService: MaterialRejectionService,
  ) {}
  @Get('indents') @Permissions('procurement.indents.read') listIndents(
    @Query() q: any,
  ) {
    return this.service.list('purchaseIndent', q);
  }
  /** Store's low-stock worklist. `minimumStock` is supplied by the material master/UI. */
  @Get('low-stock-alerts') @Roles('STORE', 'STORE_MANAGER') lowStock(
    @Req() r: any,
    @Query() q: any,
  ) {
    return this.service.lowStock(r.user?.companyId, q);
  }
  @Get('store/indent-history')
  @Roles('STORE', 'STORE_MANAGER')
  indentHistoryList(@Req() r: any, @Query() q: any) {
    return this.service.indentHistoryList(r.user?.companyId, q);
  }
  @Get('plant-head/material-indents') @Roles('PLANT_HEAD') plantHeadQueue(
    @Req() r: any,
    @Query() q: any,
  ) {
    return this.service.indentQueue(r.user?.companyId, q);
  }
  @Get('finance/po-requests')
  @Roles('FINANCE', 'FINANCE_EXECUTIVE', 'FINANCE_MANAGER')
  financeQueue(@Req() r: any, @Query() q: any) {
    return this.service.purchaseOrderQueue(r.user?.companyId, q);
  }
  @Get('super-admin/po-requests') @Roles('SUPER_ADMIN') adminQueue(
    @Req() r: any,
    @Query() q: any,
  ) {
    return this.service.purchaseOrderQueue(r.user?.companyId, {
      ...q,
      status: 'PENDING_SUPER_ADMIN_APPROVAL',
    });
  }
  @Post('indents') @Permissions('procurement.indents.create') createIndent(
    @Body() d: any,
    @Req() r: any,
  ) {
    return this.service.createIndent(d, r.user?.sub);
  }
  @Post('indents/:id/:action')
  @Permissions('procurement.indents.update')
  indentAction(
    @Param('id') id: string,
    @Param('action') a: string,
    @Body() d: any,
    @Req() r: any,
  ) {
    return this.service.indentAction(id, a, d, r.user?.sub);
  }
  @Get('indents/:id/history')
  @Permissions('procurement.indents.read')
  indentHistory(@Param('id') id: string) {
    return this.service.history('PurchaseIndent', id);
  }
  @Get('purchase-orders')
  @Permissions('procurement.purchase_orders.read')
  listPO(@Query() q: any) {
    return this.service.list('purchaseOrder', q);
  }
  @Post('purchase-orders/from-indent/:indentId')
  @Permissions('procurement.purchase_orders.create')
  createPO(@Param('indentId') id: string, @Body() d: any, @Req() r: any) {
    return this.service.createPO(id, d, r.user?.sub);
  }
  @Get('purchase-orders/:id/closure-status')
  @Permissions('procurement.purchase_orders.read')
  closureStatus(@Param('id') id: string) {
    return this.closure.evaluate(id);
  }
  @Post('purchase-orders/:id/evaluate-closure')
  @Permissions('procurement.purchase_orders.read')
  evaluateClosure(@Param('id') id: string) {
    return this.closure.evaluate(id);
  }
  @Post('purchase-orders/:id/close')
  @Permissions('procurement.purchase_orders.close')
  close(@Param('id') id: string, @Body() d: any, @Req() r: any) {
    return this.closure.close(id, r.user?.sub, d.reason);
  }
  @Post('purchase-orders/:id/:action')
  @Permissions('procurement.purchase_orders.update')
  poAction(
    @Param('id') id: string,
    @Param('action') a: string,
    @Body() d: any,
    @Req() r: any,
  ) {
    return this.service.poAction(id, a, d, r.user?.sub);
  }
  @Get('purchase-orders/:id/history')
  @Permissions('procurement.purchase_orders.read')
  poHistory(@Param('id') id: string) {
    return this.service.history('PurchaseOrder', id);
  }
  @Get('grns') @Permissions('procurement.grns.read') listGrns(@Query() q: any) {
    return this.service.list('goodsReceiptNote', q);
  }
  @Post('grns') @Permissions('procurement.grns.create') createGrn(
    @Body() d: any,
    @Req() r: any,
  ) {
    return this.service.createGrn(d, r.user?.sub);
  }
  @Post('grns/:id/:action') @Permissions('procurement.grns.update') grnAction(
    @Param('id') id: string,
    @Param('action') a: string,
    @Body() d: any,
    @Req() r: any,
  ) {
    return this.service.grnAction(id, a, d, r.user?.sub);
  }
  /** Verifies one partial/full delivery, posts accepted stock and creates its GRN atomically. */
  @Post('store/deliveries/verify')
  @Roles('STORE', 'STORE_MANAGER')
  verifyDelivery(@Body() d: any, @Req() r: any) {
    return this.service.verifyDelivery(d, r.user?.sub, r.user?.companyId);
  }
  @Get('store/deliveries') @Roles('STORE', 'STORE_MANAGER') deliveries(
    @Req() r: any,
    @Query() q: any,
  ) {
    return this.service.deliveryHistory(
      r.user?.companyId,
      q,
      r.user?.sub,
      r.user?.role,
    );
  }
  @Get('grns/:id/history') @Permissions('procurement.grns.read') grnHistory(
    @Param('id') id: string,
  ) {
    return this.service.history('GoodsReceiptNote', id);
  }
  @Get('vendor-invoices')
  @Permissions('procurement.vendor_invoices.read')
  listInvoices(@Query() q: any) {
    return this.service.list('vendorInvoice', q);
  }
  @Post('vendor-invoices')
  @Permissions('procurement.vendor_invoices.create')
  createInvoice(@Body() d: any, @Req() r: any) {
    return this.service.createInvoice(d, r.user?.sub);
  }
  @Post('vendor-invoices/:id/:action')
  @Permissions('procurement.vendor_invoices.update')
  invoiceAction(
    @Param('id') id: string,
    @Param('action') a: string,
    @Body() d: any,
    @Req() r: any,
  ) {
    return this.service.invoiceAction(id, a, d, r.user?.sub);
  }
  @Get('vendor-invoices/:id/history')
  @Permissions('procurement.vendor_invoices.read')
  invoiceHistory(@Param('id') id: string) {
    return this.service.history('VendorInvoice', id);
  }
  @Get('vendor-payments')
  @Permissions('procurement.vendor_payments.read')
  listPayments(@Query() q: any) {
    return this.service.list('vendorPayment', q);
  }
  @Post('vendor-payments')
  @Permissions('procurement.vendor_payments.create')
  createPayment(@Body() d: any, @Req() r: any) {
    return this.service.createPayment(d, r.user?.sub);
  }
  @Post('vendor-payments/:id/:action')
  @Permissions('procurement.vendor_payments.update')
  paymentAction(
    @Param('id') id: string,
    @Param('action') a: string,
    @Body() d: any,
    @Req() r: any,
  ) {
    return this.service.paymentAction(id, a, d, r.user?.sub);
  }
  @Get('vendor-payments/:id/history')
  @Permissions('procurement.vendor_payments.read')
  paymentHistory(@Param('id') id: string) {
    return this.service.history('VendorPayment', id);
  }

  @Get('reports/po')
  @Roles('STORE', 'STORE_MANAGER', 'FINANCE', 'SUPER_ADMIN')
  getPOReport(@Req() r: any) {
    return this.poReportService.getPOReport(r.user?.companyId);
  }

  @Get('material-rejections')
  @Roles('STORE', 'FINANCE', 'STORE_MANAGER', 'FINANCE_MANAGER', 'SUPER_ADMIN')
  listRejections(@Req() r: any) {
    return this.rejectionService.list(r.user?.companyId);
  }
  @Get('material-rejections/:id')
  @Roles('STORE', 'FINANCE', 'STORE_MANAGER', 'FINANCE_MANAGER', 'SUPER_ADMIN')
  getRejection(@Param('id') id: string) {
    return this.rejectionService.getById(id);
  }
  @Post('material-rejections') @Roles('STORE', 'STORE_MANAGER') createRejection(
    @Body() d: any,
    @Req() r: any,
  ) {
    return this.rejectionService.create(r.user?.companyId, d, r.user?.sub);
  }
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
