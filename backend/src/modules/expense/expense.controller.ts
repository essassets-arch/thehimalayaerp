import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ExpenseService } from './expense.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  CreateExpenseDto,
  ApproveExpenseDto,
  RejectExpenseDto,
  ExpenseQueryDto,
} from './dto/expense.dto';
import { FilesService } from '../files/files.service';

@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpenseController {
  constructor(
    private readonly expenseService: ExpenseService,
    private readonly filesService: FilesService,
  ) {}

  @Post()
  createExpense(@Body() dto: CreateExpenseDto, @Req() req: any) {
    const userId = req.user?.sub || req.user?.id;
    const companyId =
      req.headers['x-company-id'] ||
      req.user?.companyId;
    return this.expenseService.createExpense(dto, userId, companyId);
  }

  @Post('upload-receipt')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/i)) {
          return callback(
            new BadRequestException(
              'Only JPG, PNG, and GIF image files are allowed for receipt bills.',
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
      throw new BadRequestException('No receipt file provided');
    }

    const userId = req.user?.sub || req.user?.id;
    const companyId =
      req.headers['x-company-id'] || req.user?.companyId;

    const result = await this.filesService.saveUploadedFile(
      file,
      'expenses',
      'ExpenseClaim',
      undefined,
      userId,
      companyId,
    );

    return {
      success: true,
      ...result,
    };
  }

  @Get()
  getExpensesRoot(@Req() req: any) {
    const userId = req.user?.sub || req.user?.id;
    const companyId =
      req.headers['x-company-id'] || req.user?.companyId;
    return this.expenseService.getMyExpenses(userId, companyId);
  }

  @Get('my')
  getMyExpenses(@Req() req: any) {
    const userId = req.user?.sub || req.user?.id;
    const companyId =
      req.headers['x-company-id'] || req.user?.companyId;
    return this.expenseService.getMyExpenses(userId, companyId);
  }

  @Get('pending')
  getPendingExpenses(@Req() req: any) {
    const userId = req.user?.sub || req.user?.id;
    const companyId =
      req.headers['x-company-id'] || req.user?.companyId;
    return this.expenseService.getPendingExpenses(userId, companyId);
  }

  @Get('all')
  getAllExpenses(@Query() query: ExpenseQueryDto, @Req() req: any) {
    const userId = req.user?.sub || req.user?.id;
    const companyId =
      req.headers['x-company-id'] || req.user?.companyId;
    return this.expenseService.getAllExpenses(companyId, userId, query);
  }

  @Patch(':id/approve')
  approveExpense(
    @Param('id') id: string,
    @Body() dto: ApproveExpenseDto,
    @Req() req: any,
  ) {
    const userId = req.user?.sub || req.user?.id;
    const companyId =
      req.headers['x-company-id'] || req.user?.companyId;
    return this.expenseService.approveExpense(id, dto, userId, companyId);
  }

  @Patch(':id/reject')
  rejectExpense(
    @Param('id') id: string,
    @Body() dto: RejectExpenseDto,
    @Req() req: any,
  ) {
    const userId = req.user?.sub || req.user?.id;
    const companyId =
      req.headers['x-company-id'] || req.user?.companyId;
    return this.expenseService.rejectExpense(id, dto, userId, companyId);
  }
}
