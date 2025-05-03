import { BadRequestException, Body, Controller, Get, HttpStatus, InternalServerErrorException, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/user.dto';
import { 
  LoginUserDto, 
  ForgotPasswordDto, 
  ResetPasswordDto, 
  VerifyPhoneDto, 
  VerifyEmailDto, 
  SendEmailOtpDto
} from './dto/auth-dto';
import { MailerService } from 'src/helper/mailer.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { SmsService } from 'src/sms/sms.service';
import { Auth, GetUserId } from '../guard/authguard';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express'; 


@ApiTags('Auth') 
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly userService: UserService,
        private readonly mailerService: MailerService,
        private readonly smsService: SmsService,
    ) {}

    @Post('/register')
    @ApiOperation({ summary: 'Register a new user' })
    @ApiResponse({ status: 201, description: 'User registered successfully.' })
    @ApiResponse({ status: 400, description: 'User with Email already exists.' })
    async register(@Body() createUserDto: CreateUserDto) {
        let user = await this.userService.findUserByEmail(createUserDto.email);
        if (user) {
            throw new BadRequestException("User with Email already exists");
        }
        createUserDto.password = this.authService.hashedPassword(createUserDto.password);
        user = await this.userService.createUser(createUserDto);
        return { 
            statusCode: HttpStatus.CREATED, 
            data: user, 
            message: "User registered successfully" 
        };
    }

   

 

    @Post('/login')
    @ApiOperation({ summary: 'Login user and return JWT token' })
    @ApiResponse({ status: 200, description: 'Successfully logged in.' })
    @ApiResponse({ status: 400, description: 'Invalid credentials.' })
    async login(
        @Body() loginUserDto: LoginUserDto,
        @Res({ passthrough: true }) res: Response
    ) {
        const user = await this.userService.findUserByEmail(loginUserDto.email);
        if (!user) {
            throw new BadRequestException("User Email not Found");
        }

        if (user.isBanned) {
            throw new BadRequestException("Your account has been banned. Please contact support.");
         }
    
        if (!this.authService.matchPassword(loginUserDto.password, user.password)) {
            throw new BadRequestException("Password Not Matched");
        }
    
        const token = this.authService.generateToken(user);
        await this.userService.updateUserById(user._id, { token });


    
        res.cookie('token', token, {
            httpOnly: false,
            secure: false, 
            sameSite: 'lax',
        });
    
        res.cookie('role', user.role, {
            httpOnly: false,
            secure: false,        // set to true only if HTTPS
            sameSite: 'lax',
            path: '/',            // ✅ ensures it’s not scoped to /auth/login
            maxAge: 1000 * 60 * 60 * 24 * 7, // ✅ 7 days
          });
          
        
    
        return {
            statusCode: HttpStatus.OK,
            user: this.authService.serializeUser(user),
            token:token,
            message: "User Logged in Successfully",
        };
    }
    
    


    @Get('google')
    @UseGuards(AuthGuard('google'))
    async googleAuth() {
      // Redirects to Google
    }
  
    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(@Req() req, @Res() res: Response) {
      const user = await this.authService.validateOAuthLogin(req.user);
      const token = await this.authService.generateToken(user);
    
      // Set cookies (optional)
      res.cookie('token', token, {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
      });
    
      res.cookie('role', user.role, {
        httpOnly: false,
        secure: false,
        sameSite: 'strict',
      });
    
      // Redirect with token & role in query string
      const redirectUrl = `http://localhost:3000/login-success?token=${token}&role=${user.role}`;
      return res.redirect(redirectUrl);
    }
    
    
    @Auth()
    @Post('/logout')
    @ApiOperation({ summary: 'Logout user' })
    @ApiResponse({ status: 200, description: 'User logged out successfully.' })
    async logout(@Req() req: Request, @GetUserId() userId: Types.ObjectId) {
        const user = await this.userService.findUserById(userId); 
        if (!user) {
            throw new BadRequestException('User not found');
        }

        await this.userService.updateUserById(userId, { token: null });

        return {
            statusCode: HttpStatus.OK,
            message: 'User logged out successfully',
        };
    }

    @Post('/forgot-password')
    @ApiOperation({ summary: 'Send OTP for password reset' })
    async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<any> {
      try {
        const user = await this.userService.findUserByEmail(forgotPasswordDto.email);
        if (!user) {
          throw new BadRequestException('User not found');
        }
    
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
        await this.userService.updateUserById(user._id, {
          otp,
          resetTokenExpiration: new Date(Date.now() + 10 * 60 * 1000),
        });
    
        await this.mailerService.sendMail(user.email, otp);
    
        return {
          statusCode: HttpStatus.CREATED,
          message: 'OTP sent successfully to your email',
        };
      } catch (error) {
        console.error('Error in forgotPassword:', error);
        throw new InternalServerErrorException('Failed to send OTP');
      }
    }

    @Post('/reset-password')
    @ApiOperation({ summary: 'Reset user password using OTP' })
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<any> {
        const { otp, password } = resetPasswordDto;
        const user = await this.userService.findUserByOtp(otp);
        if (!user || user.otp !== otp) {
            throw new BadRequestException('Invalid OTP');
        }

        await this.userService.updateUserById(user._id, {
            password: this.authService.hashedPassword(password),
            otp: null, 
        });

        return { 
            statusCode: HttpStatus.CREATED, 
            message: 'Password reset successfully' 
        };
    }

    @Post('/change-password')
    @ApiOperation({ summary: 'Change user password' })
    async changePassword(
        @Body('userId') userId: Types.ObjectId,
        @Body('currentPassword') currentPassword: string,
        @Body('newPassword') newPassword: string,
    ): Promise<any> {
        const user = await this.userService.findUserById(userId);
        if (!user) {
            throw new BadRequestException('User not found');
        }

        if (!this.authService.matchPassword(currentPassword, user.password)) {
            throw new BadRequestException('Invalid current password');
        }

        await this.userService.updateUserById(userId, { password: this.authService.hashedPassword(newPassword) });

        return {
            statusCode: HttpStatus.OK,
            message: 'Password changed successfully',
        };
    }

    @Post('/verify-phone')
    @ApiOperation({ summary: 'Verify user phone number with OTP' })
    async verifyPhone(@Body() verifyPhoneDto: VerifyPhoneDto): Promise<any> {
        const user = await this.userService.findUserByPhoneNumber(verifyPhoneDto.mobileNumber);
        if (!user) {
            throw new BadRequestException('User not found');
        }
        const isOtpValid = await this.authService.verifyOtp(user, verifyPhoneDto.otp);
        if (!isOtpValid) {
            throw new BadRequestException('Invalid OTP');
        }
        await this.userService.updateUserById(user._id, { isPhoneVerified: true });
        return { 
            statusCode: HttpStatus.CREATED, 
            message: 'Phone number verified successfully' 
        };
    }

    @Post('/verify-email')
    @ApiOperation({ summary: 'Verify user email with OTP' })
    async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
        const user = await this.userService.findUserByEmail(verifyEmailDto.email);
        if (!user) {
            throw new BadRequestException('User not found');
        }
        const isOtpValid = await this.authService.verifyOtp(user, verifyEmailDto.otp);
        if (!isOtpValid) {
            throw new BadRequestException('Invalid OTP');
        }
        await this.userService.updateUserById(user._id, { isEmailVerified: true });
        return { 
            statusCode: HttpStatus.CREATED, 
            message: 'Email verified successfully' 
        };
    }

    @Post('/send-email-otp')
    @ApiOperation({ summary: 'Send OTP to user email for verification' })
    async sendEmailOtp(@Body() sendEmailOtpDto: SendEmailOtpDto) {
        const user = await this.userService.findUserByEmail(sendEmailOtpDto.email);
        if (!user) {
            throw new BadRequestException('User not found');
        }
    
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        console.log("Generated OTP:", otp);
    
        await this.userService.updateUserById(user._id, {
            otp
        });
    
        await this.mailerService.sendMail(user.email, `Your OTP is: ${otp}`);
    
        return {
            statusCode: HttpStatus.OK,
            message: 'OTP sent successfully to your email'
        };
    }
    

}
