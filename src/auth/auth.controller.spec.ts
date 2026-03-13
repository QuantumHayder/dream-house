import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

// https://github.com/prisma/prisma/issues/28335 -> issue when running tests
// Cannot find module './internal/class.js' from '../generated/prisma/client.ts'

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    // 1. Create a testing module that isolated the controller
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          // 2. Provide a mock implementation of AuthService
          provide: AuthService,
          useValue: {
            signup: jest.fn(),
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('signup', () => {
    it('should call authService.signup with the correct payload and return tokens', async () => {
      // Arrange
      const payload = {
        username: 'test',
        email: 'test@yahoo.com',
        password: '123',
      };
      const mockTokens = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      };

      // Force the mock to return our fake tokens instead of running real logic
      const signupSpy = jest
        .spyOn(authService, 'signup')
        .mockResolvedValue(mockTokens);

      // Act
      const result = await authController.signup(payload);

      // Assert
      expect(signupSpy).toHaveBeenCalledWith(payload);
      expect(signupSpy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockTokens); // Optional: verify the controller passes the return value down
    });
  });

  describe('login', () => {
    it('should call AuthService.login with correct payloads and return tokens', async () => {
      const payload = {
        username: 'test',
        email: 'test@yahoo.com',
        password: '123',
      };
      const mockTokens = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      };

      const loginSpy = jest
        .spyOn(authService, 'login')
        .mockResolvedValue(mockTokens);

      //Act
      const result = await authController.login(payload);

      // Assert
      expect(loginSpy).toHaveBeenCalledWith(payload);
      expect(loginSpy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockTokens);
    });
  });
});
