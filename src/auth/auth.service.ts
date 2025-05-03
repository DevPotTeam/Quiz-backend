import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/user/user.schema';
import { UserService } from 'src/user/user.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  hashedPassword(password: string): string {
    return bcrypt.hashSync(password, 10);
  }

  matchPassword(password: string, hashedPassword: string): boolean {
    return bcrypt.compareSync(password, hashedPassword);
  }

   generateToken(user: User):string {
    const payload = { email: user.email, sub: user._id };
    return this.jwtService.sign(payload);
  }

  async validateToken(token: string): Promise<User> {
    try {
      const payload = this.jwtService.verify(token);
      console.log("✅ Token Decoded:", payload);
  
      const user = await this.userService.fetchUserById(payload.sub);
      if (!user) {
        console.error("❌ User not found for ID:", payload.userId);
        throw new UnauthorizedException('User not found');
      }
  
      return user;
    } catch (error) {
      console.error("❌ Token Verification Failed:", error);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
  

  async generateOtp(): Promise<string> {
    return crypto.randomInt(100000, 999999).toString();
  }



  private readonly FIXED_OTP = '123456';
  async verifyOtp(user: any, otp: string): Promise<boolean> {
    if (!user.otp ) {
      return false;
    }
  
  
    const isOtpValid = otp === user.otp;
    
    if (isOtpValid) {
      // Clear OTP after successful verification
      user.otp = null;
      await user.save();
    }
  
    return isOtpValid;
  }
  

  serializeUser(user:User){       
    return {
      name: user.name,
      email:user.email,
      id:user._id,
      role:user.role,
      isEmailVerified:user.isEmailVerified,
    }
  }

 async validateOAuthLogin(profile: any): Promise<any> {
    const existingUser = await this.userModel.findOne({ googleId: profile.googleId });

    if (existingUser) return existingUser;

    const userWithEmail = await this.userModel.findOne({ email: profile.email });
    if (userWithEmail) {
      userWithEmail.googleId = profile.googleId;
      userWithEmail.authProvider = 'google';
      userWithEmail.profilePic = profile.profilePic;
      userWithEmail.isEmailVerified = true;
      return userWithEmail.save();
    }

    const newUser = new this.userModel({
      name: profile.name,
      email: profile.email,
      googleId: profile.googleId,
      authProvider: 'google',
      profilePic: profile.profilePic,
      isEmailVerified: true,
      role: 'user',
    });

    return newUser.save();
  }

  async generateJwt(user: any): Promise<string> {
    return this.jwtService.sign({
      email: user.email,
      sub: user._id,
    });
  }
}
