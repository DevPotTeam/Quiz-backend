import { ApiProperty } from '@nestjs/swagger';
import { 
  IsMongoId,
  IsArray, 
  IsEnum, 
  IsNotEmpty, 
  IsOptional, 
  IsString, 
  IsUrl, 
  ValidateNested, 
  IsNumber, 
  IsBoolean ,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ContentType, CourseStatus } from '../course.schema'; 
import { Types } from 'mongoose';

// DTO for Feedback
export class CreateFeedbackDto {
  @ApiProperty({ description: 'The user ID of the feedback author' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ description: 'The feedback text provided by the user' })
  @IsString()
  @IsNotEmpty()
  feedbackText: string;
}

export class CreateContentDto {
  @ApiProperty({ enum: ContentType, description: 'The type of content (video, article, quiz)' })
  @IsEnum(ContentType)
  type: ContentType;

  @ApiProperty({ description: 'The title of the content' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'The URL of the content' })
  @IsUrl()
  @IsNotEmpty()
  url: string;
}

export class CreateLessonDto {
  @ApiProperty({ description: 'The title of the lesson' })
  @IsString()
  @IsNotEmpty()
  lessonTitle: string;

  @ApiProperty({ type: [CreateContentDto], description: 'List of contents associated with this lesson' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateContentDto)
  contents: CreateContentDto[];
}

export class CreateCourseDto {
  @ApiProperty({ description: 'The title of the course' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'The description of the course' })
  @IsString()
  @IsNotEmpty()
  description: string;

  // New Fields for the Updated Schema
  @ApiProperty({ type: [String], description: 'List of enrolled student IDs', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  enrolledStudents?: string[];

  @ApiProperty({ enum: CourseStatus, description: 'The status of the course (draft, published, archived)', required: false })
  @IsOptional()
  @IsEnum(CourseStatus)
  status?: CourseStatus;

  @ApiProperty({ description: 'List of categories associated with the course', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Type(()=>Array)
  categories?: string[];

  @ApiProperty({ description: 'List of prerequisites for the course', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Type(()=>Array)
  prerequisites?: string[];

  @ApiProperty({ description: 'Whether the course is free or not', required: false })
  @IsOptional()
  @IsBoolean()
  @Type(()=>Boolean)
  isFree?: boolean;

  @ApiProperty({ description: 'The price of the course (if paid)', required: false })
  @IsOptional()
  @IsNumber()
  @Type(()=>Number)
  price?: number;

  @ApiProperty({ description: 'Estimated duration of the course in hours', required: false })
  @IsOptional()
  @IsNumber()
  @Type(()=>Number)
  estimatedDuration?: number;

  @ApiProperty({ description: 'URL of the cover image for the course', required: false })
  @IsOptional()
  @IsUrl()
  coverImageUrl?: string;

  @ApiProperty({ type: [CreateFeedbackDto], description: 'List of feedback for the course', required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFeedbackDto)
  feedbacks?: CreateFeedbackDto[];

  @ApiProperty({ description: 'The ID of the user who created the course', required: false })
  @IsOptional()
  @IsString()
  createdBy?: string;
}

export class UpdateCourseDto {
  @ApiProperty({ description: 'The title of the course', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: 'The description of the course', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: [CreateLessonDto], description: 'List of lessons associated with the course', required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateLessonDto)
  lessons?: CreateLessonDto[];

  // Updated fields for Update DTO
  @ApiProperty({ type: [String], description: 'List of enrolled student IDs', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  enrolledStudents?: string[];

  @ApiProperty({ enum: CourseStatus, description: 'The status of the course (draft, published, archived)', required: false })
  @IsOptional()
  @IsEnum(CourseStatus)
  status?: CourseStatus;

  @ApiProperty({ description: 'List of categories associated with the course', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @ApiProperty({ description: 'List of prerequisites for the course', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  prerequisites?: string[];

  @ApiProperty({ description: 'Whether the course is free or not', required: false })
  @IsOptional()
  @IsBoolean()
  isFree?: boolean;

  @ApiProperty({ description: 'The price of the course (if paid)', required: false })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiProperty({ description: 'Estimated duration of the course in hours', required: false })
  @IsOptional()
  @IsNumber()
  estimatedDuration?: number;

  @ApiProperty({ description: 'URL of the cover image for the course', required: false })
  @IsOptional()
  @IsUrl()
  coverImageUrl?: string;

  @ApiProperty({ type: [CreateFeedbackDto], description: 'List of feedback for the course', required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFeedbackDto)
  feedbacks?: CreateFeedbackDto[];
}

export class CompleteLessonDto {
  @IsMongoId()
  courseId: string;

  @IsMongoId()
  lessonId: string;
}

export class EnrollCourseDto {
  @IsMongoId()
  courseId: string;
}

