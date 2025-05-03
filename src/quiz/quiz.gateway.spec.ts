import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { Server } from 'socket.io';
import { io, Socket } from 'socket.io-client';
import { QuizService } from './quiz.service';

describe('QuizGateway (e2e)', () => {
  let app: INestApplication;
  let server: Server;
  let clientSocket: Socket;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.listen(3000);

    server = app.getHttpServer();

    // Initialize the client socket
    clientSocket = io('http://localhost:3000');
  });

  afterAll(async () => {
    await app.close();
    clientSocket.close();
  });

  it('should handle quiz start and question broadcast', (done) => {
    clientSocket.emit('startQuiz', { quizId: 'testQuizId' });

    clientSocket.on('quizStarted', (data) => {
      expect(data.message).toBe('Quiz has started!');
      done();
    });
  });

  it('should handle answer submission and emit results', (done) => {
    clientSocket.emit('submitAnswer', {
      userId: 'user1',
      quizId: 'testQuizId',
      questionIndex: 0,
      selectedOption: 1,
    });

    clientSocket.on('answerSubmitted', (data) => {
      expect(data.userId).toBe('user1');
      expect(data.isCorrect).toBeDefined();
      done();
    });
  });
});
