import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { ReplyEntity } from './entities/reply.entity';
import { CreateReplyDto } from './dto/create-reply.dto';
import { UpdateReplyDto } from './dto/update-reply.dto';
import { IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class ReplyFilterQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  brandId?: string;

  @IsOptional()
  @IsUUID()
  specialistId?: string;
}

@Injectable()
export class ReplyService {
  constructor(
    private readonly dataSource: DataSource,
  ) {}

  private async setRlsContext(manager: EntityManager, userId?: string): Promise<void> {
    await manager.query(`SET LOCAL ROLE authenticated`);
    await manager.query(`SELECT set_config('app.current_user_id', $1, true)`, [userId || '']);
  }

  async create(dto: CreateReplyDto, userId?: string): Promise<ReplyEntity> {
    return this.dataSource.transaction(async (manager) => {
      await this.setRlsContext(manager, userId);

      const reply = manager.getRepository(ReplyEntity).create({
        brandId: dto.brandId,
        specialistId: dto.specialistId,
        replyDate: new Date(dto.replyDate),
        content: dto.content,
        createdBy: dto.createdBy || 'system',
        status: dto.status || 'active',
      });

      return manager.getRepository(ReplyEntity).save(reply);
    });
  }

  async findAll(
    query: ReplyFilterQueryDto,
    userId?: string,
  ): Promise<{
    items: ReplyEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    return this.dataSource.transaction(async (manager) => {
      await this.setRlsContext(manager, userId);

      const qb = manager
        .getRepository(ReplyEntity)
        .createQueryBuilder('reply')
        .leftJoinAndSelect('reply.brand', 'brand')
        .leftJoinAndSelect('reply.specialist', 'specialist')
        .leftJoinAndSelect('reply.evaluations', 'evaluations');

      if (query.brandId) {
        qb.andWhere('reply.brandId = :brandId', { brandId: query.brandId });
      }

      if (query.specialistId) {
        qb.andWhere('reply.specialistId = :specialistId', { specialistId: query.specialistId });
      }

      if (query.status) {
        qb.andWhere('reply.status = :status', { status: query.status });
      }

      if (query.search) {
        qb.andWhere('reply.content ILIKE :search', { search: `%${query.search}%` });
      }

      qb.orderBy('reply.replyDate', 'DESC').skip(skip).take(limit);

      const [items, total] = await qb.getManyAndCount();

      return { items, total, page, limit };
    });
  }

  async findOne(id: string, userId?: string): Promise<ReplyEntity> {
    return this.dataSource.transaction(async (manager) => {
      await this.setRlsContext(manager, userId);

      const reply = await manager.getRepository(ReplyEntity).findOne({
        where: { id },
        relations: ['brand', 'specialist', 'evaluations', 'evaluations.teamLead'],
      });

      if (!reply) {
        throw new NotFoundException(`Reply with ID "${id}" not found.`);
      }

      return reply;
    });
  }

  async update(id: string, dto: UpdateReplyDto, userId?: string): Promise<ReplyEntity> {
    return this.dataSource.transaction(async (manager) => {
      await this.setRlsContext(manager, userId);

      const repo = manager.getRepository(ReplyEntity);
      const reply = await repo.findOne({ where: { id } });

      if (!reply) {
        throw new NotFoundException(`Reply with ID "${id}" not found.`);
      }

      Object.assign(reply, {
        ...dto,
        replyDate: dto.replyDate ? new Date(dto.replyDate) : reply.replyDate,
        updatedBy: dto.updatedBy || 'system',
      });

      return repo.save(reply);
    });
  }

  async remove(id: string, userId?: string): Promise<{ deleted: true; id: string }> {
    return this.dataSource.transaction(async (manager) => {
      await this.setRlsContext(manager, userId);

      const repo = manager.getRepository(ReplyEntity);
      const reply = await repo.findOne({ where: { id } });

      if (!reply) {
        throw new NotFoundException(`Reply with ID "${id}" not found.`);
      }

      await repo.remove(reply);
      return { deleted: true, id };
    });
  }
}
