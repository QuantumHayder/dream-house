import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { UserRole } from 'generated/prisma/client';
//import * as bcrypt from 'bcrypt';
@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  private async createUser(payload: AuthDto, role: UserRole) {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(payload.password, salt);
    const user = await this.prismaService.user.create({
      data: {
        email: payload.email,
        Hash: hashedPassword,
        Fname: payload.Fname,
        Lname: payload.Lname,
        Username: payload.Username,
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
    return {
      user,
      token: await this.signToken(user.id, user.email, user.Role),
    };
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
        email: payload.email,
      },
      select: {
        id: true,
        email: true,
        Fname: true,
        Lname: true,
        Role: true,
        createdAt: true,
      },
    });
    if (!user) {
      return null;
    }
    return {
      user,
      token: await this.signToken(user.id, user.email, user.Role),
    };
  }

  async signToken(
    userId: number,
    email: string,
    role: UserRole,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email: email,
      role: role,
    };

    const timeout = this.config.get<number>('JWT_EXPIRES_IN');
    const secret = this.config.get<string>('JWT_SECRET');

    const token = await this.jwtService.signAsync(payload, {
      expiresIn: timeout,
      secret: secret,
    });
    return {
      access_token: token,
    };
  }
}
