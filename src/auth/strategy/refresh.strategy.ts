import { PassportStrategy } from '@nestjs/passport';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { Request } from 'express';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private prismaService: PrismaService,
    config: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: { sub: number; email: string }) {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
      throw new ForbiddenException('Authorization header missing');
    }
    const refreshToken = authHeader.replace('Bearer', '').trim();

    const user = await this.prismaService.user.findUnique({
      where: { id: payload.sub },
    });
    return { ...user, refreshToken };
  }
}

//https://www.elvisduru.com/blog/nestjs-jwt-authentication-refresh-token
