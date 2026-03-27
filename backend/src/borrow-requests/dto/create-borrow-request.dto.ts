import { IsInt, IsNotEmpty, IsString, IsDateString } from 'class-validator';

export class CreateBorrowRequestDto {
    @IsInt()
    @IsNotEmpty()
    assetId: number;

    @IsInt()
    @IsNotEmpty()
    userId: number;

    @IsString()
    @IsNotEmpty()
    purpose: string;

    @IsDateString()
    @IsNotEmpty()
    expectedReturn: string;
}