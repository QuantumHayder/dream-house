import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from './../src/app.module';
// import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import * as pactum from 'pactum';
import { AuthDto } from 'src/auth/dto';
import { UnitType, UserRole } from 'generated/prisma/client';
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

  const companyDto = {
    name: 'Test Company',
  };
  const projectDto = {
    name: 'Test Project',
    country: 'Egypt',
    city: 'Cairo',
    UnitTypes: [UnitType.APARTMENT, UnitType.VILLA],
  };
  const unitDto = {
    type: UnitType.VILLA,
    price: 7000000,
    size: 555,
    NumBedrooms: 5,
    NumBathrooms: 3,
  };
  //const Company: Company

  /*
    Available Units: 2 belongs to Project 1
    Available Projects: 1 belongs to company 1
    Available Companies: 1
    Available Users: 1-> Abd El-Rahman, 2-> test@yahoo.com
  */

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true, // Convert types automatically (e.g., string to number)
        },
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

  describe('User', () => {
    const userRequestDto = {
      fname: 'fTest',
      lname: 'lTest',
    };

    const wrongUserRequestDto = {
      fname: 'fTest',
      lname: 'lTest',
      role: UserRole.ADMIN,
      units: [1],
      wishlist: [2],
    };

    describe('me', () => {
      it('should return the current logged user account', () => {
        return pactum
          .spec()
          .get('/user/me')
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(200);
      });

      it('should not return the current logged user account', () => {
        return pactum.spec().get('/user/me').expectStatus(401).inspect();
      });
    });
    describe('Edit', () => {
      it('should edit user account successfully', () => {
        return pactum
          .spec()
          .patch('/user/edit')
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .withBody(userRequestDto)
          .expectStatus(200)
          .inspect();
      });
      it('should not edit user account', () => {
        return pactum
          .spec()
          .patch('/user/edit')
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .withBody(wrongUserRequestDto)
          .expectStatus(400)
          .inspect();
      });
    });

    describe('Company', () => {
      it('should create a company', () => {
        return pactum
          .spec()
          .post('/company')
          .withBody(companyDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201)
          .stores('companyId', 'body.id'); // store for next step
      });
    });

    describe('Project', () => {
      it('should create a project', () => {
        return pactum
          .spec()
          .post('/project')
          .withBody({ ...projectDto, companyId: '$S{companyId}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201)
          .stores('projectId', 'body.id');
      });
    });

    describe('Unit', () => {
      it('should create a unit', () => {
        return pactum
          .spec()
          .post('/unit')
          .withBody({ ...unitDto, projectId: '$S{projectId}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201)
          .stores('unitId', 'body.id'); // store for wishlist tests
      });
    });
    describe('Purchased Units', () => {
      it('should retrieve the purchased units of the specific user logged in', () => {
        return pactum
          .spec()
          .get('/user/purchased-units')
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .withBody(userRequestDto)
          .expectStatus(200);
      });

      it('should return 401 when no token is provided', () => {
        return pactum.spec().get('/user/purchased-units').expectStatus(401);
      });
    });

    describe('WishList Units', () => {
      it('should retrieve the purchased units of the specific user logged in', () => {
        return pactum
          .spec()
          .get('/user/wishlist')
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .withBody(userRequestDto)
          .expectStatus(200);
      });

      it('should return 401 when no token is provided', () => {
        return pactum.spec().get('/user/wishlist').expectStatus(401);
      });

      it.todo('should add unit to wishlist');
      it.todo('should retrieve wishlist with added unit');
      it.todo('should remove unit from wishlist');
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
