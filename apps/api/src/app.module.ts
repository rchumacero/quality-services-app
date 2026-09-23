import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './common/database/database.module';
import { SupabaseModule } from './supabase/supabase.module';
import { HealthModule } from './modules/health/health.module';
import { ServicesModule } from './modules/services/services.module';
import { BrandModule } from './modules/brand/brand.module';
import { UserModule } from './modules/user/user.module';
import { BrandUserModule } from './modules/brand-user/brand-user.module';
import { ReplyModule } from './modules/reply/reply.module';
import { EvaluationModule } from './modules/evaluation/evaluation.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env', '../../.env'],
    }),
    DatabaseModule,
    SupabaseModule,
    HealthModule,
    ServicesModule,
    BrandModule,
    UserModule,
    BrandUserModule,
    ReplyModule,
    EvaluationModule,
  ],
})
export class AppModule {}
