export declare class LoginUserDto {
    email: string;
    password: string;
}
export declare class GenerateOtpDto {
    email: string;
}
export declare class ResetPasswordDto {
    otp: string;
    password: string;
}
export declare class ForgotPasswordDto {
    email: string;
}
export declare class VerifyPhoneDto {
    mobileNumber: string;
    otp: string;
}
export declare class VerifyEmailDto {
    email: string;
    otp: string;
}
