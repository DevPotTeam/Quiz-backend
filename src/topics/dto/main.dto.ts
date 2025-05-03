import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

// DTO for creating a main topic
export class CreateMainTopicDto {
  @ApiProperty({
    description: 'The name of the main topic.',
    example: 'Biology',
  })
  @IsString()
  name: string;
}

// DTO for updating a main topic
export class UpdateMainTopicDto {
  @ApiProperty({
    description: 'The updated name of the main topic.',
    example: 'Advanced Biology',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;
}
