import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { GetUser } from 'src/auth/decorator';
import { JwtAccessGuard } from 'src/auth/guard';
import { UserRequestDto } from './dto';

@Controller('user')
@UseGuards(JwtAccessGuard)
export class UserController {
  constructor(private userService: UserService) {}

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
    console.log('constructor:', payload.constructor.name);
    console.log('payload:', JSON.stringify(payload));
    console.log('keys:', Object.keys(payload));
    return await this.userService.editUser(userId, payload);
  }

  @Get('/purchased-units')
  async getPurchasedUnits(@GetUser('id') userId: number) {
    return await this.userService.getPurchasedUnits(userId);
  }

  @Get('/wishlist')
  async getWishlist(@GetUser('id') userId: number) {
    return await this.userService.getWishlist(userId);
  }

  @Post('/wishlist/:unitId')
  async addToWishlist(
    @GetUser('id') userId: number,
    @Param('unitId', ParseIntPipe) unitId: number,
  ) {
    return this.userService.addToWishlist(userId, unitId);
  }

  @Delete('/wishlist/:unitId')
  async removeFromWishlist(
    @GetUser('id') userId: number,
    @Param('unitId', ParseIntPipe) unitId: number,
  ) {
    return this.userService.removeFromWishlist(userId, unitId);
  }
}
