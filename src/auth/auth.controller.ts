import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
//import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { Role } from 'src/user/decorators/roles.decorator';
import { UserRole } from 'generated/prisma/client';
//import { JwtAuthGuard } from './guard';
import { RolesGuard } from 'src/user/guards/roles.guard';
import { JwtAuthGuard } from './guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  signup(@Body() payload: AuthDto) {
    return this.authService.signup(payload);
  }

  @Post('/signup-agent')
  signupAgent(@Body() payload: AuthDto) {
    return this.authService.signupAgent(payload);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(UserRole.ADMIN)
  @Patch('/promote-agent')
  promoteAgent(@Body('email') email: string) {
    return this.authService.promote_agent(email);
  }

  @HttpCode(HttpStatus.OK)
  @Post('/login')
  login(@Body() payload: AuthDto) {
    return this.authService.login(payload);
  }
}
