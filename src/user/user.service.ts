import { Injectable, NotFoundException } from '@nestjs/common';
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

  async getWishlist(userId: number): Promise<Unit[]> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: { wishList: true },
    });

    if (!user) throw new NotFoundException('User not found');

    return user?.wishList ?? [];
  }

  async addToWishlist(
    userId: number,
    unitId: number,
  ): Promise<UserResponseDto> {
    const unit = await this.prisma.unit.findUnique({ where: { id: unitId } });
    if (!unit) {
      throw new NotFoundException(`Unit with id ${unitId} not found`);
    }
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        wishList: {
          connect: { id: unitId },
        },
      },
    });
    return toUserResponseDto(user);
  }

  async removeFromWishlist(
    userId: number,
    unitId: number,
  ): Promise<UserResponseDto> {
    const unit = await this.prisma.unit.findUnique({ where: { id: unitId } });
    if (!unit) {
      throw new NotFoundException(`Unit with id ${unitId} not found`);
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
        wishList: { some: { id: unitId } },
      },
    });

    if (!user) {
      throw new NotFoundException(
        `Unit with id ${unitId} not found in wishlist`,
      );
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        wishList: {
          disconnect: { id: unitId },
        },
      },
    });
    return toUserResponseDto(updatedUser);
  }
}
