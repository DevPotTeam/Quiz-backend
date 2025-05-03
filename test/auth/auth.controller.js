"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const user_service_1 = require("../user/user.service");
const user_dto_1 = require("../user/dto/user.dto");
const auth_dto_1 = require("./dto/auth-dto");
const mailer_service_1 = require("../helper/mailer.service");
const swagger_1 = require("@nestjs/swagger");
const mongoose_1 = require("mongoose");
let AuthController = class AuthController {
    constructor(authService, userService, mailerService) {
        this.authService = authService;
        this.userService = userService;
        this.mailerService = mailerService;
    }
    async register(createUserDto) {
        let user = await this.userService.findUserByEmail(createUserDto.email);
        if (user) {
            throw new common_1.BadRequestException("User with Email already exists");
        }
        createUserDto.password = this.authService.hashedPassword(createUserDto.password);
        user = await this.userService.createUser(createUserDto);
        return {
            statusCode: common_1.HttpStatus.CREATED,
            data: user,
            message: "User registered successfully"
        };
    }
    async login(loginUserDto) {
        const user = await this.userService.findUserByEmail(loginUserDto.email);
        if (!user) {
            throw new common_1.BadRequestException("User Email not Found");
        }
        if (!this.authService.matchPassword(loginUserDto.password, user.password)) {
            throw new common_1.BadRequestException("Password Not Matched");
        }
        const token = this.authService.generateToken(user);
        await this.userService.updateUserById(user._id, { token });
        return {
            statusCode: common_1.HttpStatus.OK,
            user: this.authService.serializeUser(user),
            token: token,
            message: "User Logged in Successfully",
        };
    }
    async logout(userId) {
        const user = await this.userService.findUserById(userId);
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        if (!user.token) {
            throw new common_1.BadRequestException('User is already logged out');
        }
        await this.userService.updateUserById(userId, { token: null });
        return {
            statusCode: common_1.HttpStatus.OK,
            message: 'User logged out successfully',
        };
    }
    async forgotPassword(forgotPasswordDto) {
        const user = await this.userService.findUserByEmail(forgotPasswordDto.email);
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        await this.userService.updateUserById(user._id, { otp });
        await this.mailerService.sendMail({ email: user.email, otp });
        return {
            statusCode: common_1.HttpStatus.CREATED,
            message: 'OTP sent successfully',
            Otp: user.otp
        };
    }
    async resetPassword(resetPasswordDto) {
        const { otp, password } = resetPasswordDto;
        const user = await this.userService.findUserByOtp(otp);
        if (!user || user.otp !== otp) {
            throw new common_1.BadRequestException('Invalid OTP');
        }
        await this.userService.updateUserById(user._id, {
            password: this.authService.hashedPassword(password),
            otp: null,
        });
        return {
            statusCode: common_1.HttpStatus.CREATED,
            message: 'Password reset successfully'
        };
    }
    async changePassword(userId, currentPassword, newPassword) {
        const user = await this.userService.findUserById(userId);
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        const isPasswordMatched = this.authService.matchPassword(currentPassword, user.password);
        if (!isPasswordMatched) {
            throw new common_1.BadRequestException('Invalid current password');
        }
        const hashedNewPassword = this.authService.hashedPassword(newPassword);
        await this.userService.updateUserById(userId, { password: hashedNewPassword });
        return {
            statusCode: common_1.HttpStatus.OK,
            message: 'Password changed successfully',
        };
    }
    async verifyPhone(verifyPhoneDto) {
        const user = await this.userService.findUserByPhoneNumber(verifyPhoneDto.mobileNumber);
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        const isOtpValid = await this.authService.verifyOtp(user, verifyPhoneDto.otp);
        if (!isOtpValid) {
            throw new common_1.BadRequestException('Invalid OTP');
        }
        await this.userService.updateUserById(user._id, { isPhoneVerified: true });
        return {
            statusCode: common_1.HttpStatus.CREATED,
            message: 'Phone number verified successfully'
        };
    }
    async verifyEmail(verifyEmailDto) {
        const user = await this.userService.findUserByEmail(verifyEmailDto.email);
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        const isOtpValid = await this.authService.verifyOtp(user, verifyEmailDto.otp);
        if (!isOtpValid) {
            throw new common_1.BadRequestException('Invalid OTP');
        }
        await this.userService.updateUserById(user._id, { isEmailVerified: true });
        return {
            statusCode: common_1.HttpStatus.CREATED,
            message: 'Email verified successfully'
        };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('/register'),
    (0, swagger_1.ApiOperation)({ summary: 'Register a new user' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'User registered successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'User with Email already exists.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_dto_1.CreateUserDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('/login'),
    (0, swagger_1.ApiOperation)({ summary: 'Login user and return JWT token' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Successfully logged in.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid credentials.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.LoginUserDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('/logout'),
    (0, swagger_1.ApiOperation)({ summary: 'Logout user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User logged out successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'User not found or already logged out.' }),
    __param(0, (0, common_1.Body)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [mongoose_1.Types.ObjectId]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Post)('/forgot-password'),
    (0, swagger_1.ApiOperation)({ summary: 'Send OTP for password reset' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'OTP sent successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'User not found.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.ForgotPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Post)('/reset-password'),
    (0, swagger_1.ApiOperation)({ summary: 'Reset user password using OTP' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Password reset successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid OTP.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.ResetPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Post)('/change-password'),
    (0, swagger_1.ApiOperation)({ summary: 'Change user password' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Password changed successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid current password.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found.' }),
    __param(0, (0, common_1.Body)('userId')),
    __param(1, (0, common_1.Body)('currentPassword')),
    __param(2, (0, common_1.Body)('newPassword')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [mongoose_1.Types.ObjectId, String, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Post)('/verify-phone'),
    (0, swagger_1.ApiOperation)({ summary: 'Verify user phone number with OTP' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Phone number verified successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'User not found or invalid OTP.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.VerifyPhoneDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyPhone", null);
__decorate([
    (0, common_1.Post)('/verify-email'),
    (0, swagger_1.ApiOperation)({ summary: 'Verify user email with OTP' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Email verified successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'User not found or invalid OTP.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.VerifyEmailDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyEmail", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        user_service_1.UserService,
        mailer_service_1.MailerService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map