import { HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';
import { CreateUserDto } from 'src/user/dto/user.dto';
import { LoginUserDto, ForgotPasswordDto, ResetPasswordDto, VerifyPhoneDto, VerifyEmailDto } from './dto/auth-dto';
import { MailerService } from 'src/helper/mailer.service';
import { Types } from 'mongoose';
export declare class AuthController {
    private readonly authService;
    private readonly userService;
    private readonly mailerService;
    constructor(authService: AuthService, userService: UserService, mailerService: MailerService);
    register(createUserDto: CreateUserDto): Promise<{
        statusCode: HttpStatus;
        data: import("mongoose").Document<unknown, {}, import("../user/user.schema").UserDocument> & import("../user/user.schema").UserDocument & {
            _id: Types.ObjectId;
        } & {
            __v?: number;
        };
        message: string;
    }>;
    login(loginUserDto: LoginUserDto): Promise<{
        statusCode: HttpStatus;
        user: {
            name: string;
            email: string;
            id: Types.ObjectId;
            token: string;
        };
        token: string;
        message: string;
    }>;
    logout(userId: Types.ObjectId): Promise<{
        statusCode: HttpStatus;
        message: string;
    }>;
    forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<any>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<any>;
    changePassword(userId: Types.ObjectId, currentPassword: string, newPassword: string): Promise<any>;
    verifyPhone(verifyPhoneDto: VerifyPhoneDto): Promise<any>;
    verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<{
        statusCode: HttpStatus;
        message: string;
    }>;
}
