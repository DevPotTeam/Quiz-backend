import { 
  IsString, IsBoolean, IsDate, IsOptional, MaxLength, MinLength, 
  IsNotEmpty, IsEmail, IsMongoId, IsArray, IsEnum, IsUrl, 
  IsNumber,
  ValidateNested
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class ActivityTrackerDto {
  @ApiProperty({ description: 'Date of the activity', example: '2024-04-03T00:00:00.000Z' })
  @IsDate()
  date: Date;

  @ApiProperty({ description: 'Number of activities recorded on the date', example: 3 })
  @IsNumber()
  activityCount: number;
}

export class UserDto {
  @ApiProperty({ description: 'The name of the user', example: 'John Doe' })
  @IsString()
  readonly name: string;

  @ApiProperty({ description: 'The date of birth of the user', type: String, example: '1990-01-01T00:00:00.000Z' })
  @IsOptional()
  @IsDate()
  readonly dob?: Date;

  @ApiProperty({ description: 'The email address of the user', example: 'john.doe@example.com' })
  @IsEmail()
  readonly email: string;

  @ApiProperty({ description: 'The password of the user', example: 'securepassword123' })
  @IsString()
  readonly password: string;

  @ApiProperty({ description: 'The authentication token of the user', required: false, example: 'some-jwt-token' })
  @IsOptional()
  @IsString()
  readonly token?: string;

  @ApiProperty({ description: 'The profile picture URL of the user', required: false, example: 'https://example.com/profile-pic.jpg' })
  @IsOptional()
  @IsUrl()
  readonly profilePic?: string;

  @ApiProperty({ description: 'The mobile number of the user', required: false, example: '+1234567890' })
  @IsOptional()
  @IsString()
  readonly mobileNumber?: string;

  @ApiProperty({ description: 'The city of the user', required: false, example: 'New York' })
  @IsOptional()
  @IsString()
  readonly city?: string;

  @ApiProperty({ description: 'The state of the user', required: false, example: 'California' })
  @IsOptional()
  @IsString()
  readonly state?: string;

  @ApiProperty({ description: 'Indicates if the phone number is verified', example: true })
  @IsBoolean()
  readonly isPhoneVerified: boolean;

  @ApiProperty({ description: 'Indicates if the email is verified', example: true })
  @IsBoolean()
  readonly isEmailVerified: boolean;

  @ApiProperty({ description: 'Expiration date for the reset token', required: false, type: String, example: '2024-10-18T00:00:00.000Z' })
  @IsOptional()
  @IsDate()
  readonly resetTokenExpiration?: Date;

  @ApiProperty({ description: 'The OTP for verification', required: false, example: '123456' })
  @IsOptional()
  @IsString()
  readonly otp?: string;

  @ApiProperty({ description: 'The address of the user', required: false, example: '123 Main St, Springfield' })
  @IsOptional()
  @IsString()
  readonly address?: string;
}

export class CreateUserDto {
  @ApiProperty({ description: 'The name of the user', example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'The email of the user', example: 'johndoe@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'The mobile number of the user', example: '+1234567890' })
  @IsString()
  @IsNotEmpty()
  mobileNumber: string;

  @ApiProperty({ description: 'The password of the user', example: 'strongpassword', minLength: 6, maxLength: 20 })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(20)
  password: string;

  @ApiProperty({ description: 'The profile picture URL of the user', required: false, example: 'https://example.com/profile-pic.jpg' })
  @IsOptional()
  @IsUrl()
  profilePic?: string;

  @ApiProperty({ description: 'The city of the user', required: false, example: 'Indore' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ description: 'The state of the user', required: false, example: 'California' })
  @IsOptional()
  @IsString()
  state?: string;
}

export class UpdateUserDto {
  @ApiProperty({ description: 'The name of the user', required: false, example: 'John Doe' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'The date of birth of the user', required: false, type: String, example: '1990-01-01T00:00:00.000Z' })
  @IsOptional()
  @IsDate()
  dob?: Date;

  @ApiProperty({ description: 'The email address of the user', required: false, example: 'john.doe@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'The mobile number of the user', required: false, example: '+1234567890' })
  @IsOptional()
  @IsString()
  mobileNumber?: string;

  @ApiProperty({ description: 'The password of the user', required: false, example: 'securepassword123' })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({ description: 'The authentication token of the user', required: false, example: 'some-jwt-token' })
  @IsOptional()
  @IsString()
  token?: string;

  @ApiProperty({ description: 'The profile picture URL of the user', required: false, example: 'https://example.com/profile-pic.jpg' })
  @IsOptional()
  @IsUrl()
  profilePic?: string;

  @ApiProperty({ description: 'The user’s learning level', required: false, example: 'Beginner', enum: ['Beginner', 'Intermediate', 'Advanced'] })
  @IsOptional()
  @IsEnum(['Beginner', 'Intermediate', 'Advanced'])
  level?: string;

  @ApiProperty({ description: 'The user’s learning pace', required: false, example: 'Regular', enum: ['Relaxed', 'Regular', 'Intensive'] })
  @IsOptional()
  @IsEnum(['Relaxed', 'Regular', 'Intensive'])
  learningPace?: string;

  @ApiProperty({ description: 'One-time password for verification', required: false, example: '123456' })
  @IsOptional()
  @IsString()
  otp?: string;

  @ApiProperty({ description: 'Expiration time of OTP', required: false, type: String, example: '2025-03-21T10:00:00.000Z' })
  @IsOptional()
  @IsDate()
  resetTokenExpiration?: Date;

  @ApiProperty({ description: 'Indicates if the phone number is verified', required: false, example: true })
  @IsOptional()
  @IsBoolean()
  isPhoneVerified?: boolean;

  @ApiProperty({ description: 'Indicates if the email is verified', required: false, example: true })
  @IsOptional()
  @IsBoolean()
  isEmailVerified?: boolean;

  @ApiProperty({ description: 'User activity tracker data (last 100 days)', required: false, type: [ActivityTrackerDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActivityTrackerDto)
  activityTracker?: ActivityTrackerDto[];
}

export class FetchUserDto {
  @ApiProperty({ description: 'The unique identifier of the user (MongoDB ObjectId)', example: '60b8d6c8f1d8c1a3348f571b' })
  @IsMongoId()
  readonly id: string;
}

// dto/create-badge.dto.ts
export class CreateBadgeDto {
  name: string;
  description?: string;
  icon?: string;
}

// dto/assign-badge.dto.ts
export class AssignBadgeDto {
  userId: string;
  badgeId: string;
}

import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePreferencesDto {
  @ApiPropertyOptional({
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    description: 'User learning level',
    example: 'Intermediate',
  })
  @IsEnum(['Beginner', 'Intermediate', 'Advanced'])
  @IsOptional()
  level?: string;

  @ApiPropertyOptional({
    enum: ['Relaxed', 'Regular', 'Intensive'],
    description: 'User learning pace',
    example: 'Relaxed',
  })
  @IsEnum(['Relaxed', 'Regular', 'Intensive'])
  @IsOptional()
  learningPace?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'User areas of interest',
    example: ['Math', 'Science', 'History'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  areasOfInterest?: string[];
}


export class BanUnbanUserDto {
  @IsMongoId()
  userId: string;

  @IsBoolean()
  isBanned: boolean;

  @IsOptional()
  @IsString()
  reason?: string;
}



