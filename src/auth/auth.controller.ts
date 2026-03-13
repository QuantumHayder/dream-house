import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Get,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
//import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { JwtAccessGuard } from './guard';
import type { Request, Response } from 'express';
import { JwtRefreshGuard } from './guard/jwtRefresh.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  async signup(@Body() payload: AuthDto) {
    return this.authService.signup(payload);
  }

  @Post('/signup-agent')
  async signupAgent(@Body() payload: AuthDto) {
    return this.authService.signupAgent(payload);
  }

  @HttpCode(HttpStatus.OK)
  @Post('/login')
  async login(@Body() payload: AuthDto) {
    return this.authService.login(payload);
  }

  @UseGuards(JwtAccessGuard)
  @Get('/logout')
  async logout(@Req() req: Request) {
    const userReq = req.user;
    if (!userReq) {
      throw new BadRequestException('No user object in req');
    }
    return this.authService.logout(userReq['id']);
  }

  @UseGuards(JwtRefreshGuard)
  @Get('/refresh')
  async refreshTokens(@Req() req: Request) {
    const userReq = req.user;
    if (!userReq) {
      throw new BadRequestException('No user object in req');
    }
    return this.authService.refreshToken(
      userReq['id'],
      userReq['hashedRefreshToken'],
    );
  }
}
