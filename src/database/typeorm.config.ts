import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { User } from '../users/entities/user.entity';

@Injectable()
export class TypeormConfig implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME,
      password: String(process.env.DB_PASSWORD),
      database: process.env.DB_DATABASE,
      entities: [User],
      synchronize: true,
      dropSchema: false,
      keepConnectionAlive: true,
      logging: true,
      extra: {
        max: 100,
      },
      migrations: ['src/database/migrations/*.ts'],
      migrationsTableName: 'migrations',
      cli: {
        migrationsDir: 'src/migrations',
      },
    } as TypeOrmModuleOptions;
  }
}
