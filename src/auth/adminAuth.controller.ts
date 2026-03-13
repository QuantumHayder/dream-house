import { Body, Controller, UseGuards, Patch } from '@nestjs/common';

import { AuthService } from './auth.service';
import { Role } from 'src/user/decorators/roles.decorator';
import { UserRole } from 'generated/prisma/client';
import { RolesGuard } from 'src/user/guards/roles.guard';
import { JwtAccessGuard } from './guard';

@UseGuards(JwtAccessGuard, RolesGuard)
@Role(UserRole.ADMIN)
@Controller('auth/admin')
export class AdminAuthController {
  constructor(private authService: AuthService) {}

  @Patch('/promote-agent')
  async promoteAgent(@Body('email') email: string) {
    return this.authService.promote_agent(email);
  }
}
