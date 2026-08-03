import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UseGuards, Controller, Get, Query, Req, Res } from '@nestjs/common';
import { StoreReportsService } from './store-reports.service';
import type { Response } from 'express';

@Controller('store-reports')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class StoreReportsController {
  constructor(private readonly storeReportsService: StoreReportsService) {}

  @RequirePermissions('admin.storereports.read')
  @Get('dashboard')
  getDashboard(@Query() q: any, @Req() req: any) {
    const companyId = req.headers['x-company-id'] || req.user?.companyId;
    return this.storeReportsService.getDashboard(
      companyId,
      q.month,
      q.year,
      q.from,
      q.to,
    );
  }

  @RequirePermissions('admin.storereports.read')
  @Get('export/pdf')
  exportPdf(@Query() q: any, @Req() req: any, @Res() res: Response) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=store-report.pdf',
    );
    res.send('%PDF-1.4\n1 0 obj\n<< /Title (Store Report) >>\nendobj\n%EOF');
  }

  @RequirePermissions('admin.storereports.read')
  @Get('export/excel')
  exportExcel(@Query() q: any, @Req() req: any, @Res() res: Response) {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=store-report.csv',
    );
    res.send(
      'Material,Opening Stock,Consumed,Closing Stock\nSteel,100,20,80\nAlum,50,10,40',
    );
  }
}
