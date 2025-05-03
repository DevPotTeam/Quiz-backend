import { 
  Controller, Get, Post, Body, Param, Put, Delete, 
  InternalServerErrorException, UseInterceptors, UploadedFile, 
  NotFoundException, HttpStatus 
} from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto, CreateLessonDto, UpdateCourseDto,CompleteLessonDto, EnrollCourseDto } from './dto/dto'; 
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../helper/cloudinary.service';
import { Types } from 'mongoose';
import { Auth, GetUserId } from '../guard/authguard';

@ApiTags('courses')
@Controller('courses')
export class CourseController {
  constructor(
    private readonly courseService: CourseService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  @Get('getAllCourses')
  @ApiResponse({ status: 200, description: 'List of courses returned successfully.' })
  async getCourses() {
    const courses = await this.courseService.getCourses();
    // console.log("All course IDs:", courses.map(c => c._id.toString()));
    if (!courses || courses.length === 0) {
      throw new NotFoundException({ statusCode: 404, message: 'No courses found' });
    }
    return {
      statusCode: HttpStatus.OK,
      message: 'Successfully retrieved courses',
      data: courses,
    };
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file')) 
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new InternalServerErrorException('No file uploaded');
    }
    return this.cloudinaryService.uploadFile(file, 'courses', 'video'); 
  }

  @Post('upload-image')
  @UseInterceptors(FileInterceptor('file')) 
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new InternalServerErrorException('No image uploaded'); 
    }
    return this.cloudinaryService.uploadFile(file, 'courses', 'image'); 
  }

  @Auth()  
  @Post('create')
  @ApiResponse({ status: 201, description: 'Course created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid course data.' })
  async createCourse(
    @Body() courseData: CreateCourseDto, 
    @GetUserId() userId: Types.ObjectId 
  ) {
    try {
      const course = await this.courseService.createCourse(courseData, userId);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Course created successfully',
        data: course,
      };
    } catch (error) {
      console.error('Error creating course:', error);
      throw new InternalServerErrorException('Failed to create course');
    }
  }
  

  @Post('add-to-course/:courseId')
  @ApiResponse({ status: 200, description: 'Lesson added to course successfully.' })
  @ApiResponse({ status: 404, description: 'Course not found.' })
  async addLessonToCourse(
    @Param('courseId') courseId: string,
    @Body() createLessonDto: CreateLessonDto,
  ) {
    try {
      const updatedCourse = await this.courseService.addLessonToCourse(courseId, createLessonDto);
      if (!updatedCourse) {
        throw new NotFoundException({ statusCode: 404, message: 'Course not found' });
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'Lesson added successfully',
        data: updatedCourse,
      };
    } catch (error) {
      console.error('Error adding lesson to course:', error);
      throw new InternalServerErrorException('Failed to add lesson to course');
    }
  }

  @Get('get/:id')
  @ApiResponse({ status: 200, description: 'Course found successfully.' })
  @ApiResponse({ status: 404, description: 'Course not found.' })
  async getCourseById(@Param('id') id: string) {
    const course = await this.courseService.getCourseById(id);
    if (!course) {
      throw new NotFoundException({ statusCode: 404, message: 'Course not found' });
    }
    return {
      statusCode: HttpStatus.OK,
      message: 'Successfully retrieved course',
      data: course,
    };
  }

  @Put('update/:id')
  @ApiResponse({ status: 200, description: 'Course updated successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid course data.' })
  @ApiResponse({ status: 404, description: 'Course not found.' })
  async updateCourse(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    try {
      const updatedCourse = await this.courseService.updateCourse(id, updateCourseDto);
      if (!updatedCourse) {
        throw new NotFoundException({ statusCode: 404, message: 'Course not found' });
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'Successfully updated course',
        data: updatedCourse,
      };
    } catch (error) {
      console.error('Error updating course:', error);
      throw new InternalServerErrorException('Failed to update course');
    }
  }

  @Delete('delete/:id')
  @ApiResponse({ status: 200, description: 'Course deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Course not found.' })
  async deleteCourse(@Param('id') id: string) {
    try {
      const deletedCourse = await this.courseService.deleteCourse(id);
      return {
        statusCode: HttpStatus.OK,
        message: 'Successfully deleted course',
        data: deletedCourse,
      };
    } catch (error) {
      console.error('Error deleting course:', error);
      throw new InternalServerErrorException('Failed to delete course');
    }
  }

  @Auth()
  @Post('complete-lesson')
  @ApiResponse({ status: 200, description: 'Lesson marked as completed.' })
  @ApiResponse({ status: 404, description: 'Course or Lesson not found.' })
  async completeLesson(
    @Body() completeLessonDto: CompleteLessonDto,
    @GetUserId() userId: Types.ObjectId
  ) {
    try {
      const { courseId, lessonId } = completeLessonDto;
      console.log("courseId type:", typeof courseId, courseId);
      const result = await this.courseService.completeLesson(courseId, lessonId, userId);
      return {
        statusCode: HttpStatus.OK,
        message: 'Lesson marked as completed',
        data: result,
      };
    } catch (error) {
      console.error('Error completing lesson:', error);
      throw new InternalServerErrorException('Failed to mark lesson as completed');
    }
  }

  @Auth() 
  @Post('enroll')
  async enrollInCourse(
    @Body() dto: EnrollCourseDto,
    @GetUserId() userId:Types.ObjectId
  ) {
    return this.courseService.enrollUserInCourse(userId, dto.courseId);
  }


  @Auth()
  @Get('my-courses')
  async getMyCreatedCourses(@GetUserId() userId: Types.ObjectId) {
    const courses = await this.courseService.getCreatedCourses(userId);
    return {
      statusCode: 200,
      message: 'Successfully fetched your courses',
      data: courses,
    };
  }
}
