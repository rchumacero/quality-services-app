import {
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class BaseAuditEntity {
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp with time zone',
    nullable: false,
    update: false,
  })
  createdAt!: Date;

  @Column({
    name: 'created_by',
    type: 'varchar',
    length: 100,
    nullable: true,
    update: false,
  })
  createdBy!: string;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp with time zone',
    nullable: true,
  })
  updatedAt?: Date;

  @Column({
    name: 'updated_by',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  updatedBy?: string;

  @Column({
    name: 'status',
    type: 'varchar',
    length: 50,
    default: 'active',
  })
  status!: string;
}
