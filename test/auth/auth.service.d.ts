import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { User } from 'src/user/user.schema';
import { UserService } from 'src/user/user.service';
export declare class AuthService {
    private readonly userModel;
    private readonly jwtService;
    private readonly userService;
    constructor(userModel: Model<User>, jwtService: JwtService, userService: UserService);
    hashedPassword(password: string): string;
    matchPassword(password: string, hashedPassword: string): boolean;
    generateToken(user: User): string;
    validateToken(token: string): Promise<User>;
    generateOtp(): Promise<string>;
    private readonly FIXED_OTP;
    verifyOtp(user: any, otp: string): Promise<boolean>;
    serializeUser(user: User): {
        name: string;
        email: string;
        id: import("mongoose").Types.ObjectId;
        token: string;
    };
}
