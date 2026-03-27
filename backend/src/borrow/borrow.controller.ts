import { Controller, Post, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { BorrowService } from './borrow.service';

@Controller('borrow')
export class BorrowController {
    constructor(private readonly borrowService: BorrowService) { }

    @Patch('approve/:id')
    async approve(@Param('id', ParseIntPipe) id: number) {
        return await this.borrowService.approveRequest(id);
    }
}