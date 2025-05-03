import { Test, TestingModule } from '@nestjs/testing';
import { QuizService } from './quiz.service';
import { getModelToken } from '@nestjs/mongoose';
import { Quiz } from './quiz.schema';

describe('QuizService', () => {
  let service: QuizService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizService,
        {
          provide: getModelToken(Quiz.name),
          useValue: {}, // Mock the Quiz model
        },
      ],
    }).compile();

    service = module.get<QuizService>(QuizService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should calculate ranks correctly', () => {
    const participants = [
      { userId: 'user1', correctAnswers: 2 },
      { userId: 'user2', correctAnswers: 5 },
      { userId: 'user3', correctAnswers: 3 },
    ];

    const rankedParticipants = service.calculateRanks(participants);

    expect(rankedParticipants[0].userId).toBe('user2');
    expect(rankedParticipants[0].rank).toBe(1);
    expect(rankedParticipants[1].userId).toBe('user3');
    expect(rankedParticipants[1].rank).toBe(2);
    expect(rankedParticipants[2].userId).toBe('user1');
    expect(rankedParticipants[2].rank).toBe(3);
  });
});
