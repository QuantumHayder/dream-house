import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
//import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/decorator';
//import type { User } from 'generated/prisma/client';
import { JwtAccessGuard } from 'src/auth/guard';
import { UserRequestDto } from './dto';

@Controller('user')
@UseGuards(JwtAccessGuard)
export class UserController {
  constructor(private userService: UserService) {}
  @Post()
  create() {
    // return this.userService.create(payload);
    return null;
  }

  @Get('/me')
  async getMe(@GetUser('id') userId: number) {
    //@GetUser('id') userId: number -> To get a specific paramter
    // const userId = user.id;
    return await this.userService.getMe(userId);
  }

  @Patch('/edit')
  async editUser(
    @GetUser('id') userId: number,
    @Body() payload: UserRequestDto,
  ) {
    return await this.userService.editUser(userId, payload);
  }

  @Get('/purchased-units')
  async getPurchasedUnits(@GetUser('id') userId: number) {
    return await this.userService.getPurchasedUnits(userId);
  }
}
