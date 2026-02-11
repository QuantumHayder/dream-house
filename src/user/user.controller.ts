import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard';
import { UserService } from './user.service';
import { UserRole } from 'generated/prisma/client';
import { Roles } from './decorators/roles.decorator';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private userService: UserService) {}
  @Post()
  @Roles(UserRole.ADMIN)
  create() {
    // return this.userService.create(payload);
    return null;
  }
}
