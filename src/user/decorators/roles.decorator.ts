import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'generated/prisma/client';

export const ROLES_KEY = 'Role';
export const Role = (...Role: UserRole[]) => SetMetadata(ROLES_KEY, Role);
