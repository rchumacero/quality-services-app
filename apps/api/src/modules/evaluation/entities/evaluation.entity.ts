import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseAuditEntity } from '../../../common/entities/base-audit.entity';
import { EvaluationModel } from '@quality-services/types';
import { ReplyEntity } from '../../reply/entities/reply.entity';
import { UserEntity } from '../../user/entities/user.entity';

@Entity({ name: 'tevaluation' })
export class EvaluationEntity extends BaseAuditEntity implements EvaluationModel {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'reply_id', type: 'uuid' })
  replyId!: string;

  @Column({ name: 'team_lead_id', type: 'uuid' })
  teamLeadId!: string;

  @Column({ name: 'evaluation_date', type: 'timestamp with time zone' })
  evaluationDate!: Date;

  @Column({ name: 'score', type: 'integer' })
  score!: number;

  @Column({ name: 'error_tags', type: 'varchar', length: 100, nullable: true })
  errorTags!: string | null;

  @Column({ name: 'feedback', type: 'text', nullable: true })
  feedback!: string | null;

  @ManyToOne(() => ReplyEntity, (reply) => reply.evaluations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reply_id' })
  reply?: ReplyEntity;

  @ManyToOne(() => UserEntity, (user) => user.teamLeadEvaluations, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'team_lead_id' })
  teamLead?: UserEntity;
}
