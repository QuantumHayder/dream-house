import { Body, Controller, Post, UseGuards } from '@nestjs/common';
//import { JwtAuthGuard } from 'src/auth/guard';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('user')
@UseGuards(AuthGuard('jwt'))
export class UserController {
  constructor(private userService: UserService) {}
  @Post()
  create() {
    // return this.userService.create(payload);
    return null;
  }
}
