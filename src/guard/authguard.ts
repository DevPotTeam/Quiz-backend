import {
  applyDecorators,
  CanActivate,
  createParamDecorator,
  ExecutionContext,
  UseGuards,
  UnauthorizedException
} from "@nestjs/common";
import { Injectable } from '@nestjs/common';
import { AuthService } from "src/auth/auth.service";
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    console.log("request",request)

    // 🔐 Get token from cookies (cookie name is `token`)
    const token = request.cookies?.token || request.headers['authorization']?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('Authentication token is missing');
    }

    try {
      const user = await this.authService.validateToken(token);
      request.user = user;
      return true;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token has expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid Token');
      } else {
        throw new UnauthorizedException('Authentication failed');
      }
    }
  }
}


// ✅ Custom Decorator to get user ID from request
export const GetUserId = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();
    return req.user?._id;
  },
);

// ✅ Wrapper for cleaner usage
export function Auth() {
  return applyDecorators(UseGuards(AuthGuard));
}
