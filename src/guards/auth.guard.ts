import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtType } from '../common/types/jwt.type';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const path = request.path;
    const method = request.method;

    const excludedRoutes = this.getExcludedRoutes();

    const isExcluded = excludedRoutes.some(
      (route) => route.path === path && route.method === method,
    );

    if (isExcluded) {
      return true;
    }

    const authHeader = request.headers.authorization;
    const token = authHeader?.split(' ')[1];
    if (!token) throw new UnauthorizedException('토큰 없음');

    try {
      this.jwtService.verify<JwtType>(token);
      return true;
    } catch {
      throw new UnauthorizedException('유효하지 않은 토큰');
    }
  }

  private getExcludedRoutes(): { path: string; method: string }[] {
    return [
      { path: '/api/users/signup', method: 'POST' },
      { path: '/api/users/login', method: 'POST' },
    ];
  }
}
