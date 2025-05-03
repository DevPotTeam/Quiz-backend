import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Course, CourseDocument, Lesson, LessonDocument } from './course.schema'; 
import { CreateCourseDto , CreateLessonDto, UpdateCourseDto } from './dto/dto';  
import { UserService } from '../user/user.service';


@Injectable()
export class CourseService {
  constructor(
    @InjectModel(Course.name) private readonly courseModel: Model<CourseDocument>,
    @InjectModel(Lesson.name) private readonly lessonModel: Model<LessonDocument>,
    private readonly userService: UserService
  ) {}

  async getCourses() {
    return this.courseModel.find().populate('instructor', 'name email profilePic').exec();
  }

  async createCourse(createCourseDto: CreateCourseDto, userId: Types.ObjectId): Promise<Course> {
    try {
    
      const createdCourse = new this.courseModel({
        ...createCourseDto,
        instructor: userId, 
        createdBy: userId,  
        createdAt: new Date(),
        updatedAt: new Date(),
      });
  
     
      return createdCourse.save();
    } catch (error) {
      throw new InternalServerErrorException('Failed to create course');
    }
  }
  
  async addLessonToCourse(courseId: string, createLessonDto: CreateLessonDto): Promise<Course> {
 
    const course = await this.courseModel.findById(courseId).exec();
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }
    const createdLesson = new this.lessonModel(createLessonDto);
    const savedLesson = await createdLesson.save();
    course.lessons.push(savedLesson);
    await course.save();

    return course;
  }

  async getCourseById(id: string): Promise<Course> {
    const course = await this.courseModel
      .findById(id)
      .populate('instructor', 'name email profilePic')
      .exec();
  
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
  
    return course;
  }

  async updateCourse(id: string, updateCourseDto: UpdateCourseDto): Promise<Course> {
    const updatedCourse = await this.courseModel.findByIdAndUpdate(id, updateCourseDto, {
      new: true,
    }).exec();

    if (!updatedCourse) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return updatedCourse;
  }

  async deleteCourse(id: string): Promise<void> {
    const deletedCourse = await this.courseModel.findByIdAndDelete(id).exec();

    if (!deletedCourse) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
  }

  async completeLesson(courseId: string, lessonId: string, userId: Types.ObjectId) {
    if (!Types.ObjectId.isValid(courseId)) {
      throw new BadRequestException('Invalid courseId');
    }
    const course = await this.courseModel.findById(courseId);
    if (!course) {
      throw new NotFoundException('Course not found');
    }
  
    const lessonExists = course.lessons.some(
      (lesson: any) => lesson._id.toString() === lessonId
    );
    if (!lessonExists) {
      throw new NotFoundException('Lesson not found in this course');
    }
  
    let progress = course.lessonProgress.find(lp => lp.userId.equals(userId));
  
    if (progress) {
      const alreadyCompleted = progress.completedLessons.some(id => id.equals(lessonId));
      if (!alreadyCompleted) {
        progress.completedLessons.push(new Types.ObjectId(lessonId));
      }
    } else {
      course.lessonProgress.push({
        userId,
        completedLessons: [new Types.ObjectId(lessonId)],
      });
    }
  
    await course.save();
  
    return {
      completedLessons: course.lessonProgress.find(lp => lp.userId.equals(userId))?.completedLessons.length || 0,
      totalLessons: course.lessons.length,
    };
  }

  async enrollUserInCourse(userId: Types.ObjectId, courseId: string) {
    if (!Types.ObjectId.isValid(courseId)) {
      throw new BadRequestException('Invalid courseId');
    }
  
    const courseObjectId = new Types.ObjectId(courseId);
    const user = await this.userService.findUserById(userId);
    const course = await this.getCourseById(courseId);
  
    if (!user || !course) {
      throw new NotFoundException('User or Course not found');
    }
  
    // Prevent duplicate enrollment
    const alreadyEnrolled = user.coursesEnrolled.some((id) => id.equals(courseObjectId));
    if (alreadyEnrolled) {
      throw new BadRequestException('User is already enrolled in this course');
    }
  
    // Add course to user's enrolled list
    user.coursesEnrolled.push(courseObjectId);
    await user.save();
  
    // Add user to course's enrolled students
    course.enrolledStudents.push(userId);
    await this.courseModel.updateOne(
      { _id: courseObjectId },
      { $addToSet: { enrolledStudents: userId } } 
    );
    
  
    return {
      message: 'User successfully enrolled in the course',
      courseId,
      userId,
    };
  }

  async getCreatedCourses(userId: Types.ObjectId) {
    return this.courseModel.find({ createdBy: userId });
  }
  
  
}
