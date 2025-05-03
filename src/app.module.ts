import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { HelperModule } from './helper/helper.module';
import { QuizModule } from './quiz/quiz.module';
import { CourseModule } from './course/course.module';
import { QuizService } from './quiz/quiz.service';
import { TopicsModule } from './topics/topics.module';
// import { WalletModule } from './wallet/wallet.module'; 
// import { TransactionModule } from './transaction/transaction.module';
// import { RazorpayModule } from './razorpay/razorpay.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SmsService } from './sms/sms.service';
import * as dotenv from 'dotenv';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { WithdrawlsModule } from './withdrawals/withdrawals.module';
import { BannerModule } from './banner/banner.module';
import { FlashcardsModule } from './flashcards/flashcards.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { multerConfig } from './utils/multer.config';
import { MulterModule } from '@nestjs/platform-express';



dotenv.config(); 

@Module({
  imports: [
    UserModule,
    AuthModule,
    CourseModule,
    QuizModule,
    MongooseModule.forRoot(process.env.MONGO_URI),
    TopicsModule,
    MulterModule.register(multerConfig),
    // WalletModule, 
    // TransactionModule,
    // RazorpayModule,
    ScheduleModule.forRoot(),
    // WithdrawlsModule,
    BannerModule,
    FlashcardsModule,
    LeaderboardModule,
  ],
  controllers: [
    AppController,  
  ],
  providers: [
    AppService, 
    SmsService, 
  ],
})
export class AppModule {}
