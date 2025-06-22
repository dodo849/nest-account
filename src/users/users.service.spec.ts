import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { User } from './entities/user.entity';

// bcrypt 모킹
jest.mock('bcrypt');
const mockedBcrypt = jest.mocked(bcrypt);

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<UsersRepository>;

  // 테스트용 mock 데이터
  const mockUser: User = {
    uuid: 'test-uuid-1234',
    name: '김땡땡',
    email: 'test@example.com',
    password: 'hashedPassword123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCreateUserDto: CreateUserDto = {
    name: '김땡땡',
    email: 'test@example.com',
    password: 'password123',
  };

  const mockLoginDto: LoginDto = {
    email: 'test@example.com',
    password: 'password123',
  };

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      findByEmail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(UsersRepository);

    (mockedBcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');
    (mockedBcrypt.compare as jest.Mock).mockResolvedValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('새로운 사용자를 생성하고 반환해야 함', async () => {
      repository.create.mockResolvedValue(mockUser);

      const result = await service.create(mockCreateUserDto);

      expect(result).toEqual(mockUser);
    });

    it('Repository 에러 시 예외를 전파해야 함', async () => {
      const repositoryError = new Error('Database connection failed');
      repository.create.mockRejectedValue(repositoryError);

      await expect(service.create(mockCreateUserDto)).rejects.toThrow(
        repositoryError,
      );
    });
  });

  describe('login', () => {
    it('유효한 자격증명으로 로그인하면 사용자를 반환해야 함', async () => {
      repository.findByEmail.mockResolvedValue(mockUser);

      const result = await service.login(mockLoginDto);

      expect(result).toEqual(mockUser);
    });

    it('존재하지 않는 이메일로 로그인하면 NotFoundException을 던져야 함', async () => {
      repository.findByEmail.mockResolvedValue(null);

      await expect(service.login(mockLoginDto)).rejects.toThrow(
        new NotFoundException('사용자를 찾을 수 없음'),
      );
    });

    it('잘못된 비밀번호로 로그인하면 UnauthorizedException을 던져야 함', async () => {
      repository.findByEmail.mockResolvedValue(mockUser);
      (mockedBcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(mockLoginDto)).rejects.toThrow(
        new UnauthorizedException('비밀번호가 틀림'),
      );
    });

    it('bcrypt 에러 시 예외를 전파해야 함', async () => {
      repository.findByEmail.mockResolvedValue(mockUser);
      const bcryptError = new Error('bcrypt comparison failed');
      (mockedBcrypt.compare as jest.Mock).mockRejectedValue(bcryptError);

      await expect(service.login(mockLoginDto)).rejects.toThrow(bcryptError);
    });
  });

  describe('Integration Scenarios', () => {
    it('사용자 생성 후 로그인 시나리오', async () => {
      // 사용자 생성
      repository.create.mockResolvedValue(mockUser);
      const createdUser = await service.create(mockCreateUserDto);

      // 로그인 시도
      repository.findByEmail.mockResolvedValue(createdUser);
      (mockedBcrypt.compare as jest.Mock).mockResolvedValue(true);
      const loginResult = await service.login(mockLoginDto);

      expect(createdUser).toEqual(mockUser);
      expect(loginResult).toEqual(mockUser);
    });
  });
});
