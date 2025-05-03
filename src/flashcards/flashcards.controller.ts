import {
  Controller, Get, Post, Body, Patch, Param, Delete,
  HttpStatus
} from '@nestjs/common';
import { FlashcardsService } from './flashcards.service';
import { AssignQuizDto, CreateFlashcardDto, UpdateFlashcardDto } from './dto/flashcards.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { Auth, GetUserId } from '../guard/authguard';
import { Types } from 'mongoose';

@ApiTags('flashcards')
@Controller('flashcards')
export class FlashcardsController {
  constructor(private readonly flashcardsService: FlashcardsService) {}

  @Auth()
  @Post('create')
  @ApiOperation({ summary: 'Create a new flashcard' })
  @ApiBody({ type: CreateFlashcardDto })
  @ApiResponse({ status: 201, description: 'Flashcard created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async create(
    @Body() createFlashcardDto: CreateFlashcardDto,
    @GetUserId() userId: Types.ObjectId,
  ) {
    const flashcard = await this.flashcardsService.create(createFlashcardDto, userId);
    return {
      statusCode: 201,
      message: 'Flashcard created successfully',
      data: flashcard,
    };
  }

  @Get('getAllFlashcards')
  @ApiOperation({ summary: 'Get all flashcards' })
  @ApiResponse({ status: 200, description: 'List of flashcards' })
  async findAll() {
    const flashcards = await this.flashcardsService.findAll();
    return {
      statusCode: 200,
      message: 'Fetched all flashcards',
      data: flashcards,
    };
  }

  // flashcard.controller.ts
    @Get('grouped-by-topic')
    async getGroupedByTopic() {
      const flashcard = await this.flashcardsService.getFlashcardsGroupedByTopic();
      return {
        status:HttpStatus.OK,
        message:"Flashcards Retrieved successfully",
        data:flashcard
      };
    };


  @Get('getFlashcardById/:id')
  @ApiOperation({ summary: 'Get a flashcard by ID' })
  @ApiParam({ name: 'id', type: String })
  async findOne(@Param('id') id: string) {
    const flashcard = await this.flashcardsService.findOne(id);
    return {
      statusCode: 200,
      message: 'Flashcard fetched successfully',
      data: flashcard,
    };
  }

  @Patch('updateFlashcardById/:id')
  @ApiOperation({ summary: 'Update a flashcard' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateFlashcardDto })
  async update(
    @Param('id') id: string,
    @Body() updateFlashcardDto: UpdateFlashcardDto,
  ) {
    const updated = await this.flashcardsService.update(id, updateFlashcardDto);
    return {
      statusCode: 200,
      message: 'Flashcard updated successfully',
      data: updated,
    };
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: 'Delete a flashcard' })
  @ApiParam({ name: 'id', type: String })
  async remove(@Param('id') id: string) {
    const result = await this.flashcardsService.delete(id);
    return {
      statusCode: 200,
      message: 'Flashcard deleted successfully',
      data: result,
    };
  }

  @Patch('confidence/:id')
  @ApiOperation({ summary: 'Update confidence level' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        confidenceLevel: { type: 'string', enum: ['low', 'medium', 'high'] },
      },
    },
  })
  async updateConfidence(
    @Param('id') id: string,
    @Body('confidenceLevel') confidenceLevel: 'low' | 'medium' | 'high',
  ) {
    const updated = await this.flashcardsService.updateConfidence(id, confidenceLevel);
    return {
      statusCode: 200,
      message: 'Confidence level updated',
      data: updated,
    };
  }

  @Patch('rate/:id')
  @ApiOperation({ summary: 'Rate a flashcard' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        rating: { type: 'integer', minimum: 1, maximum: 5 },
      },
    },
  })
  async rateFlashcard(
    @Param('id') id: string,
    @Body('rating') rating: number,
  ) {
    const rated = await this.flashcardsService.rateFlashcard(id, rating);
    return {
      statusCode: 200,
      message: 'Flashcard rated successfully',
      data: rated,
    };
  }

  @Patch('verify/:id')
  @ApiOperation({ summary: 'Verify a flashcard (Admin Only)' })
  @ApiParam({ name: 'id', type: String })
  async verifyFlashcard(@Param('id') id: string) {
    const verified = await this.flashcardsService.verifyFlashcard(id);
    return {
      statusCode: 200,
      message: 'Flashcard verified successfully',
      data: verified,
    };
  }

  @Get('subject/:subject')
  @ApiOperation({ summary: 'Get flashcards by subject' })
  @ApiParam({ name: 'subject', type: String })
  async findBySubject(@Param('subject') subject: string) {
    const cards = await this.flashcardsService.findBySubject(subject);
    return {
      statusCode: 200,
      message: `Flashcards for subject "${subject}" fetched`,
      data: cards,
    };
  }

  @Get('top-rated')
  @ApiOperation({ summary: 'Get top-rated flashcards' })
  async findTopRated() {
    const topRated = await this.flashcardsService.findTopRated();
    return {
      statusCode: 200,
      message: 'Top-rated flashcards fetched',
      data: topRated,
    };
  }

  // @Auth()
  // @Post('submit-answer/:id')
  // async submitAnswer(
  //   @Param('id') flashcardId: string,
  //   @GetUserId() userId: Types.ObjectId,
  //   @Body('answer') answer: string,
  // ) {
  //   const response = await this.flashcardsService.submitAnswer(flashcardId, userId, answer);
  //   return {
  //     statusCode: 200,
  //     message: 'Answer submitted',
  //     data: response,
  //   };
  // }

  @Get('attempts/:id')
  async getFlashcardAttempts(@Param('id') flashcardId: string) {
    const attempts = await this.flashcardsService.getFlashcardAttempts(flashcardId);
    return {
      statusCode: 200,
      message: 'Flashcard attempts fetched',
      data: attempts,
    };
  }

  @Patch(':id/assign-quiz')
  @ApiOperation({ summary: 'Assign quizzes to a flashcard' })
  @ApiParam({
    name: 'id',
    description: 'Flashcard ID',
    example: '6618c9b78d3f62f7c88e2a1a',
  })
  @ApiResponse({ status: 200, description: 'Flashcard updated with quizzes' })
  assignQuizzesToFlashcard(
    @Param('id') flashcardId: string,
    @Body() assignQuizDto: AssignQuizDto,
  ) {
    return this.flashcardsService.assignQuizzesToFlashcard(flashcardId, assignQuizDto);
  }

  @Auth()
  @Post('/join/:id')
  async joinFlashcard(
    @Param('id') flashcardId: string,
    @GetUserId() userId : Types.ObjectId,
  ) {
    return this.flashcardsService.joinFlashcard(userId, flashcardId);
  }

  @Auth()
  @Get('my-flashcards')
  async getMyCreatedFlashcards(@GetUserId() userId: Types.ObjectId) {
    const flashcards = await this.flashcardsService.getCreatedFlashcards(userId);
    return {
      statusCode: 200,
      message: 'Successfully fetched your flashcards',
      data: flashcards,
    };
  }

}
