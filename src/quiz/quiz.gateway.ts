// import { WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, MessageBody } from '@nestjs/websockets';
// import { Logger } from '@nestjs/common';
// import { Server, Socket } from 'socket.io';
// import { Quiz } from './quiz.schema';
// import { StartQuizDto, SubmitAnswerDto } from './dto/dto';
// import { QuizService } from './quiz.service';

// @WebSocketGateway()
// export class QuizGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
//   @WebSocketServer() server: Server;
//   private logger: Logger = new Logger('QuizGateway');

//   // In-memory storage for quiz states and participants
//   private quizStates: Map<string, { status: string; participants: { userId: string; correctAnswers: number }[] }> = new Map();

//   constructor(private readonly quizService: QuizService) {}

//   // Called once WebSocket server is initialized
//   afterInit(server: Server) {
//     this.logger.log('WebSocket server initialized');
//   }

//   // Called when a new client connects
//   handleConnection(client: Socket, ...args: any[]) {
//     this.logger.log(`Client connected: ${client.id}`);
//   }

//   // Called when a client disconnects
//   handleDisconnect(client: Socket) {
//     this.logger.log(`Client disconnected: ${client.id}`);
//   }

//   async handleQuizStart(@MessageBody() startQuizDto: StartQuizDto): Promise<void> {
//     const { quizId } = startQuizDto;
//     const quiz = await this.quizService.getQuizById(quizId);

//     if (!quiz) {
//       this.server.emit('quizError', { message: 'Quiz not found' });
//       return;
//     }

//     const now = new Date();
//     const delay = new Date(quiz.startTime).getTime() - now.getTime();

//     // Initialize quiz state in memory
//     this.quizStates.set(quizId, { status: 'started', participants: [] });

//     setTimeout(() => {
//       this.logger.log('Quiz started!');
//       this.server.emit('quizStarted', { message: 'Quiz has started!', quizId });

//       this.sendNextQuestion(quiz, quizId, 0);
//     }, Math.max(delay, 0)); // Ensure non-negative delay
//   }

//   private async sendNextQuestion(quiz: Quiz, quizId: string, questionIndex: number) {
//     if (questionIndex < quiz.questions.length) {
//       const currentQuestion = quiz.questions[questionIndex];
//       const options = currentQuestion.options.map(option => ({
//         value: option.value,
//         type: option.type,
//       }));

//       this.server.emit('newQuestion', {
//         question: currentQuestion.question,
//         options: options,
//         questionIndex: questionIndex,
//       });

//       // Wait 30 seconds before sending the next question
//       setTimeout(() => this.sendNextQuestion(quiz, quizId, questionIndex + 1), 30000);
//     } else {
//       this.finishQuiz(quizId);
//     }
//   }

//   private async finishQuiz(quizId: string) {
//     const quizState = this.quizStates.get(quizId);

//     if (!quizState) {
//       this.server.emit('quizError', { message: 'Quiz state not found' });
//       return;
//     }

//     const rankedParticipants = this.quizService.calculateRanks(quizState.participants);

//     this.server.emit('quizFinished', { rankings: rankedParticipants });
//     this.quizStates.delete(quizId); // Clean up memory
//   }

//   @SubscribeMessage('submitAnswer')
//   async handleAnswerSubmission(
//     @MessageBody() submitAnswerDto: SubmitAnswerDto,
//   ): Promise<void> {
//     const { userId, quizId, questionIndex, selectedOption } = submitAnswerDto;
//     const quiz = await this.quizService.getQuizById(quizId);

//     if (!quiz || !quiz.questions[questionIndex]) {
//       this.server.emit('quizError', { message: 'Invalid quiz or question index' });
//       return;
//     }

//     const question = quiz.questions[questionIndex];
//     const correctOption = question.options.find(option => option.correctAnswer);

//     if (!correctOption) {
//       this.server.emit('quizError', { message: 'No correct answer available' });
//       return;
//     }

//     const isCorrect = selectedOption === correctOption.value;

//     // Track participant's correct answers in memory
//     const quizState = this.quizStates.get(quizId);

//     if (!quizState) {
//       this.server.emit('quizError', { message: 'Quiz state not found' });
//       return;
//     }

//     let participant = quizState.participants.find(p => p.userId === userId);

//     if (!participant) {
//       participant = { userId, correctAnswers: 0 };
//       quizState.participants.push(participant);
//     }

//     if (isCorrect) {
//       participant.correctAnswers++;
//     }

//     this.server.emit('answerSubmitted', {
//       userId,
//       isCorrect,
//       correctAnswer: correctOption.value,
//       questionIndex,
//     });
//   }
// }
