import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

// DTO for creating a subtopic
export class CreateSubTopicDto {
  @ApiProperty({
    description: 'The name of the subtopic.',
    example: 'Introduction to Biology',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The ID of the main topic this subtopic belongs to.',
    example: '605c72b1f6d2c2a5b8b8e9b0',
  })
  @IsOptional()
  @IsString()
  mainTopic: string;
}

// DTO for updating a subtopic
export class UpdateSubTopicDto {
  @ApiProperty({
    description: 'The name of the subtopic.',
    example: 'Updated Biology Subtopic',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'The ID of the main topic this subtopic belongs to.',
    example: '605c72b1f6d2c2a5b8b8e9b0',
    required: false,
  })
  @IsOptional()
  @IsString()
  mainTopic?: string;
}
