import { ForbiddenException, Injectable } from '@nestjs/common';
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
        Username: payload.Username,
      },
    });

    if (userExists) {
      throw new ForbiddenException('User Exists!');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(payload.password, salt);
    const newUser = await this.prismaService.user.create({
      data: {
        Username: payload.Username,
        email: payload.email,
        Hash: hashedPassword,
        Role: role,
      },
      select: {
        id: true,
        email: true,
        Fname: true,
        Lname: true,
        Username: true,
        Role: true,
        createdAt: true,
      },
    });

    const tokens = await this.getTokens(newUser.id, newUser.Username);
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

    if (user && user.Role === UserRole.PENDING_AGENT) {
      const updatedUser = await this.prismaService.user.update({
        where: {
          email: email,
        },
        data: {
          Role: UserRole.AGENT,
        },
      });
      return updatedUser;
    }
  }

  async login(payload: AuthDto) {
    const user = await this.prismaService.user.findUnique({
      where: {
        Username: payload.Username,
      },
    });
    if (!user) {
      throw new ForbiddenException('Invalid UserName');
    }

    const passwordValid = await bcrypt.compare(payload.password, user.Hash);

    if (!passwordValid) {
      throw new ForbiddenException('Invalid passowrd');
    }

    const tokens = await this.getTokens(user.id, user.Username);
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

    const tokens = await this.getTokens(user.id, user.Username);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }
}

// async signToken(
//     userId: number,
//     email: string,
//     timeout: number,
//     secret: string,
//   ): Promise<string> {
//     const payload = {
//       sub: userId,
//       email: email,
//     };

//     const token = await this.jwtService.signAsync(payload, {
//       expiresIn: timeout,
//       secret: secret,
//     });
//     return token;
//   }
