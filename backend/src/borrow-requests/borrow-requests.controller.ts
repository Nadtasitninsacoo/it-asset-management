import {
    Controller,
    Post,
    Body,
    Get,
    Patch,
    Delete,
    Param,
    Query,
    UseGuards,
    ParseIntPipe
} from '@nestjs/common';
import { BorrowRequestsService } from './borrow-requests.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('borrow-requests')
export class BorrowRequestsController {
    constructor(private readonly borrowRequestsService: BorrowRequestsService) { }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'USER')
    @Patch(':id/return')
    async returnRequest(@Param('id', ParseIntPipe) id: number) {
        return this.borrowRequestsService.handleReturnProcess(id);
    }

    @UseGuards(JwtAuthGuard)
    @Get('user/:id')
    async findByUser(@Param('id', ParseIntPipe) id: number) {
        return this.borrowRequestsService.findMyHistory(id);
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    async createBorrowRequest(@Body() dto: any) {
        return this.borrowRequestsService.create(dto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'USER')
    @Get('all')
    async findAllBorrow(
        @Query('page') page: string,
        @Query('limit') limit: string
    ) {
        return this.borrowRequestsService.findAll(Number(page) || 1, Number(limit) || 6);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Patch(':id')
    async updateBorrowRequest(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: { status: string; adminComment?: string }
    ) {
        return this.borrowRequestsService.update(id, dto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Delete(':id/permanent')
    async permanentDelete(@Param('id', ParseIntPipe) id: number) {
        return this.borrowRequestsService.hardDelete(id);
    }
}