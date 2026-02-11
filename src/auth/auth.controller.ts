import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  signup(@Body() payload: AuthDto) {
    return this.authService.signup(payload);
  }

  @HttpCode(HttpStatus.OK)
  @Post('/login')
  login(@Body() payload: AuthDto) {
    return this.authService.login(payload);
  }
}
