import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUrl, IsInt, Min, IsBoolean, IsEnum, IsMongoId, IsArray } from 'class-validator';
import { Types } from 'mongoose';


export class CreateFlashcardDto {

  @ApiProperty({ description: 'The title of the flashcard' })
  @IsString()
  @IsOptional()
  title: string;

  @ApiProperty({ description: 'The description of the flashcard' })
  @IsString()
  @IsOptional()
  description: string;

  @ApiPropertyOptional({ description: 'A hint to help answer the flashcard' })
  @IsString()
  @IsOptional()
  hint?: string;

  @ApiPropertyOptional({ description: 'An optional image URL related to the flashcard' })
  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Mastery level of the flashcard', minimum: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  masteryLevel?: number;

  @ApiProperty({ description: 'User ID of the creator', example: '660e1f72c3a7e24d5b123456' })
  @IsMongoId()
  @IsOptional()
  createdBy: string;

  @ApiProperty({ description: 'The subject to which the flashcard belongs' })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiPropertyOptional({ description: 'User confidence level for this flashcard', enum: ['low', 'medium', 'high'] })
  @IsEnum(['low', 'medium', 'high'])
  @IsOptional()
  confidenceLevel?: string;

  @ApiPropertyOptional({ description: 'Indicates if the flashcard is verified by an admin' })
  @IsBoolean()
  @IsOptional()
  verifiedByAdmin?: boolean;

  @ApiPropertyOptional({ description: 'Average rating of the flashcard', minimum: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  rating?: number;

  @ApiPropertyOptional({ description: 'Number of users who rated this flashcard', minimum: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  ratingCount?: number;

  // 🔹 New fields
  @ApiProperty({ description: 'The content on the front side of the flashcard' })
  @IsString()
  @IsOptional()
  frontContent: string;

  @ApiPropertyOptional({ description: 'Image URL for the front of the flashcard' })
  @IsUrl()
  @IsOptional()
  frontImage?: string;

  @ApiProperty({ description: 'The content on the back side of the flashcard' })
  @IsString()
  @IsOptional()
  backContent: string;

  @ApiPropertyOptional({ description: 'Image URL for the back of the flashcard' })
  @IsUrl()
  @IsOptional()
  backImage?: string;

  @ApiProperty({ description: 'Topic ID the flashcard belongs to', example: '661a34179ef12a8e84123456' })
  @IsMongoId()
  @IsNotEmpty()
  topic: Types.ObjectId;
}
export class AssignQuizDto {
  @ApiProperty({
    type: [String],
    description: 'Array of Quiz IDs to assign to the flashcard',
    example: ['6618c9b78d3f62f7c88e2a1b', '6618c9b78d3f62f7c88e2a1c'],
  })
  @IsArray()
  @IsMongoId({ each: true })
  quizIds: string[];
}

export class UpdateFlashcardDto extends PartialType(CreateFlashcardDto) {}
