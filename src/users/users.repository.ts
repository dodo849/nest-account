import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersRepository {
  constructor(private readonly datasource: DataSource) {}

  async create(name: string, email: string, password: string): Promise<User> {
    const user = this.datasource.getRepository(User).create({
      name: name,
      email: email,
      password: password,
    });

    return await this.datasource.getRepository(User).save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.datasource.getRepository(User).findOneBy({ email });
  }
}
