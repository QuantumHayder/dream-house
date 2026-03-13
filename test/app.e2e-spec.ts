import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from './../src/app.module';
// import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import * as pactum from 'pactum';
import { AuthDto } from 'src/auth/dto';
import { UserRole } from 'generated/prisma/client';
// pactum is used instead of supertest

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const dto: AuthDto = {
    username: 'testUser',
    email: 'test@dreamhouse.com',
    password: '123',
  };

  const adminDto: AuthDto = {
    username: 'adminUser',
    email: 'admin@dreamhouse.com',
    password: 'admin123',
  };

  const agentDto: AuthDto = {
    username: 'agentUser',
    email: 'agent@dreamhouse.com',
    password: 'agent123',
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3001);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3001');
  });
  //.expectBodyContains(dto.firstName)
  //.withPathParams('id', '$S{bookmarkId}')
  //.expectJsonLength(1);

  describe('Auth', () => {
    describe('Signup', () => {
      it('should signup', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201)
          .stores('accessToken', 'refreshToken');
      });

      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ password: '123' })
          .expectStatus(400);
      });

      it('should signup admin user', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(adminDto)
          .expectStatus(201);
      });

      it('should signup agent', () => {
        return pactum
          .spec()
          .post('/auth/signup-agent')
          .withBody(agentDto)
          .expectStatus(201)
          .inspect();
      });
    });

    describe('Login', () => {
      it('should login', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody(dto)
          .expectStatus(200)
          .stores('accessToken', 'accessToken');
      });

      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({ email: dto.email })
          .expectStatus(400);
      });

      // Promote to admin via prisma, then login to get a real token
      it('should set admin role', async () => {
        await prisma.user.update({
          where: { email: adminDto.email },
          data: { role: UserRole.ADMIN },
        });
      });

      it('should login as admin', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody(adminDto)
          .expectStatus(200)
          .stores('adminAccessToken', 'accessToken'); // ✅ stores the real token
      });
    });

    describe('Admin', () => {
      // We need an admin token — signup a second user and promote them
      // OR your seed/cleanDb can create a default admin
      // For now, assume promoteAgent is called with an existing user's email

      it('should reject promote-agent without token', () => {
        return pactum
          .spec()
          .patch('/auth/admin/promote-agent')
          .withBody({ email: dto.email })
          .expectStatus(401);
      });

      it('should reject promote-agent with non-admin token', () => {
        return pactum
          .spec()
          .patch('/auth/admin/promote-agent')
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' }) // regular user token
          .withBody({ email: dto.email })
          .expectStatus(403);
      });

      it('should promote agent with admin token', () => {
        return pactum
          .spec()
          .patch('/auth/admin/promote-agent')
          .withHeaders({ Authorization: 'Bearer $S{adminAccessToken}' })
          .withBody({ email: dto.email })
          .expectStatus(200);
      });
    });
    describe('Logout', () => {
      it('should logout', () => {
        return pactum
          .spec()
          .get('/auth/logout')
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' }) // pactum variable syntax
          .expectStatus(200);
      });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
