import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrandUserEntity } from './entities/brand-user.entity';
import { BrandUserService } from './brand-user.service';
import { BrandUserController } from './brand-user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([BrandUserEntity])],
  controllers: [BrandUserController],
  providers: [BrandUserService],
  exports: [BrandUserService],
})
export class BrandUserModule {}
