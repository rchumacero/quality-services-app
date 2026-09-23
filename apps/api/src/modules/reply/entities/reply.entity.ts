import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseAuditEntity } from '../../../common/entities/base-audit.entity';
import { ReplyModel } from '@quality-services/types';
import { BrandEntity } from '../../brand/entities/brand.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { EvaluationEntity } from '../../evaluation/entities/evaluation.entity';

@Entity({ name: 'treply' })
export class ReplyEntity extends BaseAuditEntity implements ReplyModel {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'brand_id', type: 'uuid' })
  brandId!: string;

  @Column({ name: 'specialist_id', type: 'uuid' })
  specialistId!: string;

  @Column({ name: 'reply_date', type: 'timestamp with time zone' })
  replyDate!: Date;

  @Column({ name: 'content', type: 'text' })
  content!: string;

  @ManyToOne(() => BrandEntity, (brand) => brand.replies, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'brand_id' })
  brand?: BrandEntity;

  @ManyToOne(() => UserEntity, (user) => user.specialistReplies, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'specialist_id' })
  specialist?: UserEntity;

  @OneToMany(() => EvaluationEntity, (evaluation) => evaluation.reply)
  evaluations?: EvaluationEntity[];
}
