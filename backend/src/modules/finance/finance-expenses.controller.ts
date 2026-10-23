import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  NotFoundException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { FinanceExpensesService } from './finance-expenses.service';
import { FilesService } from '../files/files.service';
import { createReadStream } from 'fs';
import {
  CreateFinanceExpenseDto,
  UpdateFinanceExpenseDto,
  QueryFinanceExpenseDto,
  CreateFinanceCategoryDto,
  UpdateFinanceCategoryDto,
  CreateFinanceHeaderDto,
  UpdateFinanceHeaderDto,
} from './dto/finance-expense.dto';

@Controller('finance/expenses')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class FinanceExpensesController {
  constructor(
    private readonly expensesService: FinanceExpensesService,
    private readonly filesService: FilesService,
  ) {}

  @Post()
  @RequirePermissions('finance.expense.create', 'finance.payment.create', 'finance.payment.read')
  async createExpense(@Body() dto: CreateFinanceExpenseDto, @Req() req: any) {
    return this.expensesService.createExpense(dto, req.user);
  }

  @Get()
  @RequirePermissions('finance.expense.read', 'finance.payment.read', 'finance.ledger.read', 'reports.finance')
  async listExpenses(
    @Query() query: QueryFinanceExpenseDto,
    @Req() req: any,
    @Res({ passthrough: true }) res: any,
  ) {
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      Pragma: 'no-cache',
      Expires: '0',
    });
    return this.expensesService.listExpenses(query, req.user);
  }

  @Get('summary')
  @RequirePermissions('finance.expense.read', 'finance.payment.read', 'finance.ledger.read', 'reports.finance')
  async getSummary(
    @Query() query: QueryFinanceExpenseDto,
    @Req() req: any,
    @Res({ passthrough: true }) res: any,
  ) {
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      Pragma: 'no-cache',
      Expires: '0',
    });
    return this.expensesService.getSummary(query, req.user);
  }

  @Get('category-breakdown')
  @RequirePermissions('finance.expense.read', 'finance.payment.read', 'finance.ledger.read', 'reports.finance')
  async getCategoryBreakdown(
    @Query() query: QueryFinanceExpenseDto,
    @Req() req: any,
    @Res({ passthrough: true }) res: any,
  ) {
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      Pragma: 'no-cache',
      Expires: '0',
    });
    return this.expensesService.getCategoryBreakdown(query, req.user);
  }

  @Get('export')
  @RequirePermissions('finance.expense.export', 'finance.expense.read', 'finance.payment.read', 'reports.finance')
  async exportExpenses(@Query() query: QueryFinanceExpenseDto, @Req() req: any) {
    return this.expensesService.exportExpenses(query, req.user);
  }

  @Post('upload-receipt')
  @RequirePermissions('finance.expense.create', 'finance.expense.update', 'finance.payment.create', 'finance.payment.read')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp|gif|pdf)$/i)) {
          return callback(
            new BadRequestException(
              'Allowed receipt formats are JPG, PNG, WEBP, GIF, and PDF.',
            ),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async uploadReceipt(@UploadedFile() file: any, @Req() req: any) {
    if (!file) {
      throw new BadRequestException('No receipt file provided for upload.');
    }

    const userId = req.user?.sub || req.user?.id;
    const companyId = req.user?.companyId;

    const result = await this.filesService.saveUploadedFile(
      file,
      'expenses',
      'FinanceExpense',
      undefined,
      userId,
      companyId,
    );

    return {
      success: true,
      ...result,
    };
  }

  @Get(':id')
  @RequirePermissions('finance.expense.read', 'finance.payment.read', 'finance.ledger.read', 'reports.finance')
  async getExpenseById(@Param('id') id: string, @Req() req: any) {
    return this.expensesService.getExpenseById(id, req.user);
  }

  @Patch(':id')
  @RequirePermissions('finance.expense.update', 'finance.payment.update', 'finance.payment.read')
  async updateExpense(
    @Param('id') id: string,
    @Body() dto: UpdateFinanceExpenseDto,
    @Req() req: any,
  ) {
    return this.expensesService.updateExpense(id, dto, req.user);
  }

  @Get(':id/receipt')
  @RequirePermissions('finance.expense.read', 'finance.payment.read', 'finance.ledger.read', 'reports.finance')
  async downloadReceipt(
    @Param('id') id: string,
    @Req() req: any,
    @Res() res: any,
  ) {
    const expense = await this.expensesService.getExpenseById(id, req.user);
    if (!expense.receiptUrl) {
      throw new NotFoundException('No receipt attachment associated with this expense.');
    }

    const fileResult = this.filesService.resolveFile(expense.receiptUrl, 'expenses');
    if (!fileResult) {
      throw new NotFoundException('Receipt attachment file could not be found on storage.');
    }

    res.set({
      'Content-Type': fileResult.mimeType || 'application/octet-stream',
      'Content-Length': fileResult.size,
      'Cache-Control': 'private, max-age=86400',
    });

    const stream = createReadStream(fileResult.fullPath);
    return stream.pipe(res);
  }
}

@Controller('finance/expense-categories')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class FinanceExpenseCategoriesController {
  constructor(private readonly expensesService: FinanceExpensesService) {}

  @Get()
  @RequirePermissions('finance.expense.read', 'finance.payment.read', 'finance.ledger.read', 'reports.finance')
  async getCategories(
    @Query('companyId') companyId: string,
    @Query('includeInactive') includeInactive: string,
    @Req() req: any,
  ) {
    const showInactive = includeInactive === 'true' || includeInactive === '1';
    return this.expensesService.getCategories(req.user, companyId, showInactive);
  }

  @Post()
  @RequirePermissions('finance.expense.category_manage', 'finance.payment.create', 'finance.payment.read')
  async createCategory(@Body() dto: CreateFinanceCategoryDto, @Req() req: any) {
    return this.expensesService.createCategory(dto, req.user);
  }

  @Patch(':id')
  @RequirePermissions('finance.expense.category_manage', 'finance.payment.update', 'finance.payment.read')
  async updateCategory(
    @Param('id') id: string,
    @Body() dto: UpdateFinanceCategoryDto,
    @Req() req: any,
  ) {
    return this.expensesService.updateCategory(id, dto, req.user);
  }

  @Post(':id/headers')
  @RequirePermissions('finance.expense.category_manage', 'finance.payment.create', 'finance.payment.read')
  async createHeader(
    @Param('id') categoryId: string,
    @Body() dto: CreateFinanceHeaderDto,
    @Req() req: any,
  ) {
    return this.expensesService.createHeader(categoryId, dto, req.user);
  }

  @Patch(':id/headers/:headerId')
  @RequirePermissions('finance.expense.category_manage', 'finance.payment.update', 'finance.payment.read')
  async updateHeader(
    @Param('id') categoryId: string,
    @Param('headerId') headerId: string,
    @Body() dto: UpdateFinanceHeaderDto,
    @Req() req: any,
  ) {
    return this.expensesService.updateHeader(categoryId, headerId, dto, req.user);
  }
}
