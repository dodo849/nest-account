import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersRepository } from './users.repository';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(dto: CreateUserDto): Promise<User> {
    if (dto.password.length < 12) {
      throw new BadRequestException('비밀번호는 12자리 이상이어야 합니다');
    }

    const hashPassword = await bcrypt.hash(dto.password, 10);

    return await this.usersRepository.create(dto.name, dto.email, hashPassword);
  }

  async login(dto: LoginDto): Promise<User> {
    const findUser = await this.usersRepository.findByEmail(dto.email);

    if (!findUser) {
      throw new NotFoundException('사용자를 찾을 수 없음');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      findUser.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('비밀번호가 틀림');
    }

    return findUser;
  }
}
