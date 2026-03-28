import {
    Controller, Get, Post, Body, Patch, Param, Delete,
    UseInterceptors, UploadedFile, ParseIntPipe, Query
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AssetsService } from './assets.service';
import { memoryStorage } from 'multer';
import { extname } from 'path';

const storageConfig = memoryStorage();

@Controller('assets')
export class AssetsController {
    constructor(private readonly assetsService: AssetsService) { }

    @Post()
    @UseInterceptors(FileInterceptor('image', { storage: storageConfig }))
    async create(
        @Body() body: any,
        @UploadedFile() file: any
    ) {
        const assetData = {
            name: body.name,
            serialNumber: body.serialNumber,
            status: body.status || 'AVAILABLE',
            category: body.category,
            image: body.image || '/uploads/default-asset.png',
        };

        return await this.assetsService.createAsset(assetData);
    }

    @Get()
    async findAll(@Query('page') page: string) {
        const pageNumber = parseInt(page) || 1;
        return await this.assetsService.findAll(pageNumber);
    }

    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        return await this.assetsService.deleteAsset(id);
    }

    @Patch(':id')
    @UseInterceptors(FileInterceptor('image', { storage: storageConfig }))
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: any,
        @UploadedFile() file: any
    ) {
        const updateData: any = {
            name: body.name,
            serialNumber: body.serialNumber,
            status: body.status,
            category: body.category,
        };

        if (body.image) {
            updateData.image = body.image;
        }

        return await this.assetsService.updateAsset(id, updateData);
    }
}
