import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { UserRole } from 'generated/prisma/client';
// import jwt from 'jsonwebtoken';
// import { Response } from 'express';
@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  private async createUser(payload: AuthDto, role: UserRole) {
    const userExists = await this.prismaService.user.findUnique({
      where: {
        username: payload.username,
      },
    });

    if (userExists) {
      throw new BadRequestException('User Exists!');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(payload.password, salt);
    const newUser = await this.prismaService.user.create({
      data: {
        username: payload.username,
        email: payload.email,
        hash: hashedPassword,
        role: role,
      },
      select: {
        id: true,
        email: true,
        fname: true,
        lname: true,
        username: true,
        role: true,
        createdAt: true,
      },
    });

    const tokens = await this.getTokens(newUser.id, newUser.username);
    await this.updateRefreshToken(newUser.id, tokens.refreshToken);

    return tokens;
  }
  async signup(payload: AuthDto) {
    return this.createUser(payload, UserRole.CLIENT);
  }

  async signupAgent(payload: AuthDto) {
    return this.createUser(payload, UserRole.PENDING_AGENT as UserRole);
  }

  async promote_agent(email: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: email,
      },
    });

    if (user && user.role === UserRole.PENDING_AGENT) {
      const updatedUser = await this.prismaService.user.update({
        where: {
          email: email,
        },
        data: {
          role: UserRole.AGENT,
        },
      });
      return updatedUser;
    }
  }

  async login(payload: AuthDto) {
    const user = await this.prismaService.user.findUnique({
      where: {
        username: payload.username,
      },
    });
    if (!user) {
      throw new BadRequestException('Invalid UserName');
    }

    const passwordValid = await bcrypt.compare(payload.password, user.hash);

    if (!passwordValid) {
      throw new BadRequestException('Invalid passowrd');
    }

    const tokens = await this.getTokens(user.id, user.username);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: number) {
    return this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        hashedRefreshToken: null,
      },
    });
  }

  async updateRefreshToken(userId: number, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        hashedRefreshToken: hashedRefreshToken,
      },
    });
  }

  async getTokens(userId: number, username: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          username,
        },
        {
          secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
          expiresIn: this.config.getOrThrow('JWT_ACCESS_EXPIRES_IN'),
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          username,
        },
        {
          secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
          expiresIn: this.config.getOrThrow('JWT_REFRESH_EXPIRES_IN'),
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(userId: number, refreshToken: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user || !user.hashedRefreshToken) {
      throw new ForbiddenException('Access Denied, invalid user/token');
    }

    const refreshTokenMatches = refreshToken == user.hashedRefreshToken;

    if (!refreshTokenMatches) {
      throw new ForbiddenException('Access Denied, invalid token');
    }

    const tokens = await this.getTokens(user.id, user.username);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }
}
