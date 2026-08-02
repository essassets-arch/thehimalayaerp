import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import { StoreReportsService } from './store-reports.service';
import type { Response } from 'express';

@Controller('store-reports')
export class StoreReportsController {
  constructor(private readonly storeReportsService: StoreReportsService) {}

  @Get('dashboard')
  getDashboard(@Query() q: any, @Req() req: any) {
    const companyId = req.headers['x-company-id'] || req.user?.companyId;
    return this.storeReportsService.getDashboard(companyId, q.month, q.year, q.from, q.to);
  }

  @Get('export/pdf')
  async exportPdf(@Query() q: any, @Req() req: any, @Res() res: Response) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=store-report.pdf');
    res.send('%PDF-1.4\n1 0 obj\n<< /Title (Store Report) >>\nendobj\n%EOF');
  }

  @Get('export/excel')
  async exportExcel(@Query() q: any, @Req() req: any, @Res() res: Response) {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=store-report.csv');
    res.send('Material,Opening Stock,Consumed,Closing Stock\nSteel,100,20,80\nAlum,50,10,40');
  }
}
