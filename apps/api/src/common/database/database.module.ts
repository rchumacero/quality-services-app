import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrandEntity } from '../../modules/brand/entities/brand.entity';
import { UserEntity } from '../../modules/user/entities/user.entity';
import { BrandUserEntity } from '../../modules/brand-user/entities/brand-user.entity';
import { ReplyEntity } from '../../modules/reply/entities/reply.entity';
import { EvaluationEntity } from '../../modules/evaluation/entities/evaluation.entity';

export const DOMAIN_ENTITIES = [
  BrandEntity,
  UserEntity,
  BrandUserEntity,
  ReplyEntity,
  EvaluationEntity,
];

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');

        if (databaseUrl) {
          return {
            type: 'postgres',
            url: databaseUrl,
            entities: DOMAIN_ENTITIES,
            synchronize: false,
            autoLoadEntities: true,
          };
        }

        return {
          type: 'postgres',
          host: configService.get<string>('POSTGRES_HOST', 'localhost'),
          port: configService.get<number>('POSTGRES_PORT', 54322),
          username: configService.get<string>('POSTGRES_USER', 'postgres'),
          password: configService.get<string>('POSTGRES_PASSWORD', 'postgrespassword'),
          database: configService.get<string>('POSTGRES_DB', 'postgres'),
          entities: DOMAIN_ENTITIES,
          synchronize: false,
          autoLoadEntities: true,
        };
      },
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
