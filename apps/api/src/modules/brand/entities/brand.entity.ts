import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseAuditEntity } from '../../../common/entities/base-audit.entity';
import { BrandModel } from '@quality-services/types';
import { BrandUserEntity } from '../../brand-user/entities/brand-user.entity';
import { ReplyEntity } from '../../reply/entities/reply.entity';

@Entity({ name: 't_brand' })
export class BrandEntity extends BaseAuditEntity implements BrandModel {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'code', type: 'varchar', length: 30, unique: true })
  code!: string;

  @Column({ name: 'name', type: 'varchar', length: 100 })
  name!: string;

  @Column({ name: 'procedures_summary', type: 'varchar', length: 2000 })
  proceduresSummary!: string;

  @OneToMany(() => BrandUserEntity, (brandUser) => brandUser.brand)
  brandUsers?: BrandUserEntity[];

  @OneToMany(() => ReplyEntity, (reply) => reply.brand)
  replies?: ReplyEntity[];
}
