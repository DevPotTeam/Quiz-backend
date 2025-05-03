import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsEnum,
  IsBoolean,
  ValidateNested,
  IsDateString,
  IsNumber,
  IsOptional,
  IsMongoId,
  Min,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionType, OptionType, QuizMode, QuizStatus } from '../quiz.schema';
import { ApiProperty, PartialType } from '@nestjs/swagger';


export class FileUploadDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;
}

export class CreateOptionDto {
  @ApiProperty({ enum: OptionType, description: 'The type of the option (text or image).' })
  @IsEnum(OptionType)
  type: OptionType;

  @ApiProperty({ description: 'The value of the option.', example: 'Option A' })
  @IsString()
  value: string;

  @ApiProperty({ description: 'Image URL for the option (if type is image).', required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ description: 'Indicates if this option is the correct answer.', example: true })
  @IsBoolean()
  correctAnswer: boolean;
}

// Question DTO
export class CreateQuestionDto {
  @ApiProperty({ description: 'The question text.', example: 'What is the capital of France?' })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({ description: 'Image URL for the question (if applicable).', required: false })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ enum: QuestionType, description: 'The type of the question (e.g., radio, checkbox).' })
  @IsEnum(QuestionType)
  type: QuestionType;

  @ApiProperty({ type: [CreateOptionDto], description: 'The list of options for this question.' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOptionDto)
  options: CreateOptionDto[];

  @ApiProperty({ description: 'Additional description or explanation for the question.', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

// Winning Amount DTO
export class CreateWinningAmountDto {
  @ApiProperty({ description: 'The place (ranking) in the quiz.', example: 1 })
  @IsNumber()
  @Min(1)
  place: number;

  @ApiProperty({ description: 'The amount won for this place.', example: 100 })
  @IsNumber()
  @Min(0)
  amount: number;
}

// Quiz Creation DTO
export class CreateQuizDto {
  @ApiProperty({ description: 'The title of the quiz.', example: 'General Knowledge Quiz' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'URL of the quiz banner image.', example: 'https://example.com/banner.jpg' })
  @IsString()
  @IsOptional()
  banner?: string; 

  @ApiProperty({ description: 'The start time of the quiz in ISO format.', example: '2024-10-21T10:00:00Z' })
  @IsDateString()
  @IsOptional()
  startTime: string;

  @ApiProperty({ description: 'The end time of the quiz in ISO format.', example: '2024-10-21T12:00:00Z' })
  @IsDateString()
  @IsOptional()
  endTime: string;

  @ApiProperty({ type: [CreateQuestionDto], description: 'The list of questions in the quiz.' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions: CreateQuestionDto[];

  @ApiProperty({ description: 'The main topic ID associated with the quiz.', example: '605c73b2f6a7c2b6d8b8e9a1' })
  @IsMongoId()
  @IsNotEmpty()
  mainTopic: string;

  @ApiProperty({ description: 'List of sub-topic IDs associated with the quiz.' })
  @IsArray()
  @IsOptional()
  subTopics: string[];

  @ApiProperty({ description: 'The price of the quiz.', example: 10 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  price: number;

  @ApiProperty({ enum: QuizStatus, description: 'The status of the quiz.' })
  @IsEnum(QuizStatus)
  @IsOptional()
  status?: QuizStatus;

  @ApiProperty({ description: 'Total winning amount for the quiz.', example: 500 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  totalWinningAmount: number;

  @ApiProperty({ type: [CreateWinningAmountDto], description: 'List of winning amounts by place.' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateWinningAmountDto)
  @IsOptional()
  winningAmounts: CreateWinningAmountDto[];

  @ApiProperty({ enum: QuizMode, description: 'The mode of the quiz (flexible or guaranteed).' })
  @IsEnum(QuizMode)
  @IsOptional()
  quizMode: QuizMode;
}

// Quiz Update DTO
export class UpdateQuizDto extends PartialType(CreateQuizDto) {}

// Start Quiz DTO
export class StartQuizDto {
  @ApiProperty({ description: 'The ID of the quiz to start.', example: '605c73b2f6a7c2b6d8b8e9a1' })
  @IsMongoId()
  @IsNotEmpty()
  quizId: string;
}

// Submit Answer DTO
export class SubmitAnswerDto {
  @ApiProperty({ description: 'The index of the question being answered.', example: 0 })
  @IsNumber()
  @IsNotEmpty()
  questionIndex: number;

  @ApiProperty({ description: 'The selected text option for the question.', example: 'Jupiter', required: false })
  @ValidateIf((obj) => !obj.selectedImageOption) // Ensure only one option is provided
  @IsString()
  @IsNotEmpty()
  selectedTextOption?: string;

  @ApiProperty({ description: 'The selected image option for the question.', example: 'https://example.com/images/h2o_structure2.jpg', required: false })
  @ValidateIf((obj) => !obj.selectedTextOption) // Ensure only one option is provided
  @IsString()
  @IsNotEmpty()
  selectedImageOption?: string;
}

// Submit Quiz DTO
export class SubmitQuizDto {
  @ApiProperty({ description: 'Array of answers submitted by the user.', type: [SubmitAnswerDto] })
  @IsArray()
  @ValidateNested({ each: true }) // Ensures validation of nested answers
  @Type(() => SubmitAnswerDto)
  answers: SubmitAnswerDto[];

  @ApiProperty({ description: 'Time taken to complete the quiz in seconds.', example: 120 })
  @IsNumber()
  @IsNotEmpty()
  completionTime: number;
}

export class AddPlayedByDto {
  @IsMongoId()
  @IsNotEmpty()
  userId: string;
}

export class JoinQuizDto {
  @IsMongoId()
  @IsNotEmpty()
  userId: string;
}


