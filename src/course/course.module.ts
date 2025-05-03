import { forwardRef, Module } from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseSchema, LessonSchema } from './course.schema';
import { HelperModule } from '../helper/helper.module';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';

@Module({
  imports:[MongooseModule.forFeature([{name:"Course",schema:CourseSchema}]),
  MongooseModule.forFeature([{name:"Lesson",schema:LessonSchema}]),
  HelperModule,
  AuthModule,
  forwardRef(() => UserModule),
],
  providers: [CourseService],
  controllers: [CourseController]
})
export class CourseModule {}
