import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post()
  createExpense(@Body() body: any, @Req() req: any) {
    const userId = req.user?.sub || req.user?.id;
    const companyId =
      req.headers['x-company-id'] ||
      req.user?.companyId ||
      'd039cfa4-e78b-4138-adfc-1b0f14cffa91';
    return this.expenseService.createExpense(body, userId, companyId);
  }

  @Get()
  getExpensesRoot(@Req() req: any) {
    const userId = req.user?.sub || req.user?.id;
    const companyId =
      req.headers['x-company-id'] ||
      req.user?.companyId ||
      'd039cfa4-e78b-4138-adfc-1b0f14cffa91';
    return this.expenseService.getMyExpenses(userId, companyId);
  }

  @Get('my')
  getMyExpenses(@Req() req: any) {
    const userId = req.user?.sub || req.user?.id;
    const companyId =
      req.headers['x-company-id'] ||
      req.user?.companyId ||
      'd039cfa4-e78b-4138-adfc-1b0f14cffa91';
    return this.expenseService.getMyExpenses(userId, companyId);
  }

  @Get('pending')
  getPendingExpenses(@Req() req: any) {
    const userId = req.user?.sub;
    const companyId =
      req.headers['x-company-id'] ||
      req.user?.companyId ||
      'd039cfa4-e78b-4138-adfc-1b0f14cffa91';
    return this.expenseService.getPendingExpenses(userId, companyId);
  }

  @Get('all')
  getAllExpenses(@Req() req: any) {
    const userId = req.user?.sub || req.user?.id;
    const companyId =
      req.headers['x-company-id'] ||
      req.user?.companyId ||
      'd039cfa4-e78b-4138-adfc-1b0f14cffa91';
    return this.expenseService.getAllExpenses(companyId, userId);
  }

  @Patch(':id/approve')
  approveExpense(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    const userId = req.user?.sub;
    const companyId =
      req.headers['x-company-id'] ||
      req.user?.companyId ||
      'd039cfa4-e78b-4138-adfc-1b0f14cffa91';
    return this.expenseService.approveExpense(id, body, userId, companyId);
  }

  @Patch(':id/reject')
  rejectExpense(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    const userId = req.user?.sub;
    const companyId =
      req.headers['x-company-id'] ||
      req.user?.companyId ||
      'd039cfa4-e78b-4138-adfc-1b0f14cffa91';
    return this.expenseService.rejectExpense(id, body, userId, companyId);
  }
}
