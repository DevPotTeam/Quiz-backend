import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength, IsOptional, IsMobilePhone } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
    @ApiProperty({ 
        description: 'The email of the user', 
        example: 'user@example.com' 
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ 
        description: 'The password of the user', 
        minLength: 6, 
        maxLength: 18, 
        example: 'password123' 
    })
    @IsString()
    @MinLength(6)
    @MaxLength(18)
    @IsNotEmpty()
    password: string;
}

export class GenerateOtpDto {
    @ApiProperty({ 
        description: 'The email to which the OTP will be sent', 
        example: 'user@example.com' 
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;
}

export class ResetPasswordDto {
    @ApiProperty({ 
        description: 'The OTP sent to the user for password reset', 
        example: '123456' 
    })
    @IsString()
    otp: string;

    @ApiProperty({ 
        description: 'The new password for the user', 
        minLength: 6, 
        maxLength: 20, 
        example: 'newPassword123' 
    })
    @IsString()
    @MinLength(6)
    @MaxLength(20)
    password: string;
}

export class ForgotPasswordDto {
    @ApiProperty({ 
        description: 'The email for rest password ', 
        example: 'johndoe@example.com' 
    })
    @IsString()
    email: string;
}

 
export class VerifyPhoneDto {
    @ApiProperty({ 
        description: 'The mobile number of the user', 
        example: '+1234567890' 
    })
    @IsString()
    mobileNumber: string;

    @ApiProperty({ 
        description: 'The OTP sent to the user for phone verification', 
        example: '654321' 
    })
    @IsString()
    otp: string;
}

export class SendEmailOtpDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class VerifyEmailDto {
    @ApiProperty({ 
        description: 'The email of the user for verification', 
        example: 'user@example.com' 
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ 
        description: 'The OTP sent to the user for email verification', 
        example: '789012' 
    })
    @IsString()
    @IsNotEmpty()
    otp: string;
}
