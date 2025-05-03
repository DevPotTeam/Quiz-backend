import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBannerDto {
  @ApiProperty({
    description: 'URL of the banner image',
    example: 'https://example.com/banner.jpg',
  })
  @IsNotEmpty()
  @IsString()
  imageUrl: string;

  @ApiProperty({
    description: 'Status of the banner',
    enum: ['active', 'inactive'],
    example: 'active',
    required: false,
  })
  @IsOptional()
  @IsEnum(['active', 'inactive'])
  status?: string;
}

export class UpdateBannerDto {
  @ApiProperty({
    description: 'Updated URL of the banner image',
    example: 'https://example.com/new-banner.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({
    description: 'Updated status of the banner',
    enum: ['active', 'inactive'],
    example: 'inactive',
    required: false,
  })
  @IsOptional()
  @IsEnum(['active', 'inactive'])
  status?: string;
}
