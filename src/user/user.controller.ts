import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  HttpStatus,
  NotFoundException,
  Post,
  Put,
  Delete,
  InternalServerErrorException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.schema';
import { Types } from 'mongoose';
import { BanUnbanUserDto, UpdatePreferencesDto, UpdateUserDto } from './dto/user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../helper/cloudinary.service';
import { Auth, GetUserId } from '../guard/authguard';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

    @Post('upload-image')
    @UseInterceptors(FileInterceptor('file')) 
    async uploadImage(@UploadedFile() file: Express.Multer.File) {
      if (!file) {
        throw new InternalServerErrorException('No image uploaded'); 
      }
      return this.cloudinaryService.uploadFile(file, 'user', 'image'); 
    }

  @ApiOperation({ summary: 'Fetch all users' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved all users', type: '[User]' })
  @ApiResponse({ status: 404, description: 'No users found' })
  @Get('/getAllUsers')
  async getAllUsers(): Promise<{ statusCode: number; message: string; data: User[] }> {
    const users = await this.userService.getAllUsers();
    if (!users || users.length === 0) {
      throw new NotFoundException({ statusCode: 404, message: 'No users found' });
    }
    return {
      statusCode: HttpStatus.OK,
      message: 'Successfully retrieved all users',
      data: users,
    };
  }

  @ApiOperation({ summary: 'Fetch a user by ID' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved user', type: 'User' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Get('fetchUserById/:id')
  async fetchUserById(@Param('id') id: Types.ObjectId): Promise<{ statusCode: number; message: string; data: User }> {
    const user = await this.userService.fetchUserById(id);
    if (!user) {
      throw new NotFoundException({ statusCode: 404, message: 'User not found' });
    }
    return {
      statusCode: HttpStatus.OK,
      message: 'Successfully retrieved user',
      data: user,
    };
  }

  @ApiOperation({ summary: 'Update user by ID' })
  @ApiResponse({ status: 200, description: 'Successfully updated user', type: 'User' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Patch('updateUserById/:id')
  async updateUserById(
    @Param('id') id: Types.ObjectId,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<{ statusCode: number; message: string; data: User }> {
    const updatedUser = await this.userService.updateUserById(id, updateUserDto);
    if (!updatedUser) {
      throw new NotFoundException({ statusCode: 404, message: 'User not found' });
    }
    return {
      statusCode: HttpStatus.OK,
      message: 'Successfully updated user',
      data: updatedUser,
    };
  }

  @Put('role/:id')
  async updateUserRole(@Param('id') userId: string, @Body('role') role: string) {
    const updatedUser = await this.userService.updateUserRole(userId, role);
    return { statusCode: 200, message: 'User role updated successfully', data: updatedUser };
  }

  @Put('level/:id')
  async updateLevel(@Param('id') userId: string, @Body('level') level: string) {
    const updatedUser = await this.userService.updateLevel(userId, level);
    return { statusCode: 200, message: 'User level updated successfully', data: updatedUser };
  }

  @Put('learning-pace/:id')
  async updateLearningPace(@Param('id') userId: string, @Body('learningPace') learningPace: string) {
    const updatedUser = await this.userService.updateLearningPace(userId, learningPace);
    return { statusCode: 200, message: 'User learning pace updated successfully', data: updatedUser };
  }

  @Put('areas-of-interest/:id')
  async updateAreasOfInterest(@Param('id') userId: string, @Body('areasOfInterest') areasOfInterest: string[]) {
    const updatedUser = await this.userService.updateAreasOfInterest(userId, areasOfInterest);
    return { statusCode: 200, message: 'User areas of interest updated successfully', data: updatedUser };
  }

  @Patch('preferences/:userId')
  @ApiOperation({ summary: 'Update user learning preferences' })
  @ApiParam({
    name: 'userId',
    description: 'User ID (Mongo ObjectId)',
    example: '6618c22f9d8e0a5d2b5e1234',
  })
  @ApiResponse({ status: 200, description: 'User preferences updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  updatePreferences(
    @Param('userId') userId: string,
    @Body() updatePreferencesDto: UpdatePreferencesDto,
  ) {
    return this.userService.updatePreferences(userId, updatePreferencesDto);
  }


  @Get('preferences/:id')
  async getUserPreferences(@Param('id') userId: string) {
    const preferences = await this.userService.getUserPreferences(userId);
    return { statusCode: 200, message: 'User preferences retrieved successfully', data: preferences };
  }

  @Auth()
  @Post('attendance')
  async markAttendance(@GetUserId() userId: Types.ObjectId): Promise<User> {
    const user = await this.userService.fetchUserById(userId);
    if (!user) throw new NotFoundException('User not found');

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize time to avoid time zone issues

    const activity = user.activityTracker.find((entry) => 
      new Date(entry.date).getTime() === today.getTime()
    );

    if (activity) {
      activity.activityCount += 1; // Increment count if date exists
    } else {
      user.activityTracker.push({ date: today, activityCount: 1 });
    }

    await this.userService.updateUserById(userId, { activityTracker: user.activityTracker });
    return user;
  }

  @Auth()
  @Get('attendance')
  async getAttendance(@GetUserId() userId: Types.ObjectId): Promise<{ today: number; totalDays: number; activity: any[] }> {
    const user = await this.userService.fetchUserById(userId);
    if (!user) throw new NotFoundException('User not found');

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize for accurate comparison

    const todayRecord = user.activityTracker.find(entry =>
      new Date(entry.date).getTime() === today.getTime()
    );

    return {
      today: todayRecord?.activityCount || 0,
      totalDays: user.activityTracker.length,
      activity: user.activityTracker,
    };
  }


  @Post('createbadge')
  @ApiResponse({ status: 201, description: 'Badge created.' })
  async createBadge(@Body() body: { name: string; description?: string; icon?: string }) {
    const badge = await this.userService.createBadge(body);
    return {
      message: 'Badge created successfully',
      data: badge,
    };
  }

  @Post('assignbadge')
  @ApiResponse({ status: 200, description: 'Badge assigned to user.' })
  async assignBadge(
    @Body() body: { userId: string; badgeId: string }
  ) {
    const result = await this.userService.assignBadgeToUser(body.userId, body.badgeId);
    return result;
  }

  @Auth()
  @Get('created-items')
  async getMyCreatedItems(@GetUserId() userId: Types.ObjectId) {
    const items = await this.userService.getMyCreatedItems(userId);
    return {
      statusCode: 200,
      message: 'Fetched created items successfully',
      data: items,
    };
  }

  @Patch('ban-toggle')
  async toggleBan(@Body() dto: BanUnbanUserDto) {
    const userUpdateResult = await this.userService.updateBanStatus(dto.userId, dto.isBanned, dto.reason);
  
    return {
      status: HttpStatus.OK,
      message: `User ${dto.isBanned ? 'banned' : 'unbanned'} successfully`,
      data: userUpdateResult,
    };
  }

  @Auth()
  @Get('progress')
  async getUserProgress(@GetUserId() userId: Types.ObjectId) {
    const progress = await this.userService.getUserProgress(userId);
    return {
      status:HttpStatus.OK,
      message:"user data retrieved successfully",
      data: progress,
    }
  }

  
  

}
