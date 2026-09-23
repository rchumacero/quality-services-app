import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { BaseAuditEntity } from '../../../common/entities/base-audit.entity';
import { BrandUserModel } from '@quality-services/types';
import { BrandEntity } from '../../brand/entities/brand.entity';
import { UserEntity } from '../../user/entities/user.entity';

@Entity({ name: 't_brand_user' })
@Unique(['brandId', 'userId'])
export class BrandUserEntity extends BaseAuditEntity implements BrandUserModel {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'brand_id', type: 'uuid' })
  brandId!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => BrandEntity, (brand) => brand.brandUsers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'brand_id' })
  brand?: BrandEntity;

  @ManyToOne(() => UserEntity, (user) => user.brandUsers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity;
}
