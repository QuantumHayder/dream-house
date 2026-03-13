import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserResponseDto } from './dto/userResponse';
import { toUserResponseDto } from './mappers';
import { Unit } from 'generated/prisma/client';
import { UserRequestDto } from './dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getMe(userId: number): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
    });
    return toUserResponseDto(user);
  }

  async editUser(
    userId: number,
    payload: UserRequestDto,
  ): Promise<UserResponseDto> {
    const updatedUser = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        fname: payload.fname,
        lname: payload.lname,
      },
    });
    return toUserResponseDto(updatedUser);
  }

  async getPurchasedUnits(userId: number): Promise<Unit[]> {
    return await this.prisma.unit.findMany({
      where: {
        ownerId: userId,
      },
    });
  }
}
