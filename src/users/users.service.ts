import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersRepository } from './users.repository';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { User } from './entities/user.entity';
import {
  ApiResponse,
  createSuccessResponse,
} from '../common/types/api-response.type';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  private static readonly ACCESS_TOKEN_TTL = '1h';
  private static readonly REFRESH_TOKEN_TTL = '24h';

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
  ) {}

  async create(
    dto: CreateUserDto,
  ): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>> {
    const findUser = await this.usersRepository.findByEmail(dto.email);
    if (findUser != null) {
      throw new BadRequestException('이미 가입된 이메일입니다');
    }

    if (dto.password.length < 6) {
      throw new BadRequestException('비밀번호는 6자리 이상이어야 합니다');
    }

    const hashPassword = await bcrypt.hash(dto.password, 10);

    const createdUser = await this.usersRepository.create(
      dto.name,
      dto.email,
      hashPassword,
    );

    return createSuccessResponse(
      {
        accessToken: this.#createAccessToken(createdUser),
        refreshToken: this.#createRefreshToken(createdUser),
      },
      '회원가입이 완료되었습니다',
    );
  }

  async login(
    dto: LoginDto,
  ): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>> {
    const findUser = await this.usersRepository.findByEmail(dto.email);

    if (!findUser) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      findUser.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('비밀번호가 틀립니다');
    }

    return createSuccessResponse(
      {
        accessToken: this.#createAccessToken(findUser),
        refreshToken: this.#createRefreshToken(findUser),
      },
      '로그인이 완료되었습니다',
    );
  }

  #createAccessToken(user: User): string {
    return this.jwtService.sign(
      {
        email: user.email,
        uuid: user.uuid,
      },
      {
        expiresIn: UsersService.ACCESS_TOKEN_TTL,
      },
    );
  }

  #createRefreshToken(user: User): string {
    return this.jwtService.sign(
      {
        email: user.email,
        uuid: user.uuid,
      },
      {
        expiresIn: UsersService.REFRESH_TOKEN_TTL,
      },
    );
  }
}
