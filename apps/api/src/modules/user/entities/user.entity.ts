import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseAuditEntity } from '../../../common/entities/base-audit.entity';
import { UserModel } from '@quality-services/types';
import { BrandUserEntity } from '../../brand-user/entities/brand-user.entity';
import { ReplyEntity } from '../../reply/entities/reply.entity';
import { EvaluationEntity } from '../../evaluation/entities/evaluation.entity';

@Entity({ name: 'tuser' })
export class UserEntity extends BaseAuditEntity implements UserModel {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'account', type: 'varchar', length: 100, unique: true })
  account!: string;

  @Column({ name: 'name', type: 'varchar', length: 100 })
  name!: string;

  @Column({ name: 'role', type: 'varchar', length: 50 })
  role!: string;

  @OneToMany(() => BrandUserEntity, (brandUser) => brandUser.user)
  brandUsers?: BrandUserEntity[];

  @OneToMany(() => ReplyEntity, (reply) => reply.specialist)
  specialistReplies?: ReplyEntity[];

  @OneToMany(() => EvaluationEntity, (evaluation) => evaluation.teamLead)
  teamLeadEvaluations?: EvaluationEntity[];
}
