import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config/dist/config.service';
import { JwtService } from '@nestjs/jwt/dist/jwt.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
//import * as bcrypt from 'bcrypt';
@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async signup(payload: AuthDto) {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(payload.password, salt);
    const user = await this.prismaService.user.create({
      data: {
        email: payload.email,
        Hash: hashedPassword,
        Fname: payload.Fname,
        Lname: payload.Lname,
        Role: payload.Role,
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
    return {
      user,
      token: await this.signToken({ userId: user.id, email: user.email }),
    };
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
      token: await this.signToken({ userId: user.id, email: user.email }),
    };
  }

  async signToken(payload: { userId: number; email: string }) {
    const access_token = await this.jwtService.signAsync(payload, {
      expiresIn: this.config.get('JWT_EXPIRES_IN') ?? '3600',
      secret: this.config.get('JWT_SECRET'),
    });
    return { access_token: access_token };
  }
}
