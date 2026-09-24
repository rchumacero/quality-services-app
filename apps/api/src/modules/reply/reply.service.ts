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
  brandIds?: string | string[];

  @IsOptional()
  brandId?: string;

  @IsOptional()
  createdBys?: string | string[];

  @IsOptional()
  createdBy?: string;

  @IsOptional()
  tagErrors?: string | string[];

  @IsOptional()
  tagError?: string;

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

  async getCreatedByOptions(userId?: string): Promise<string[]> {
    return this.dataSource.transaction(async (manager) => {
      await this.setRlsContext(manager, userId);
      const results = await manager
        .getRepository(ReplyEntity)
        .createQueryBuilder('reply')
        .select('DISTINCT reply.createdBy', 'createdBy')
        .where('reply.createdBy IS NOT NULL AND reply.createdBy != \'\'')
        .getRawMany();

      return results.map((r) => r.createdBy).filter(Boolean);
    });
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
    const limit = query.limit || 50;
    const skip = (page - 1) * limit;

    const parseMultiSelect = (val?: string | string[]): string[] => {
      if (!val) return [];
      if (Array.isArray(val)) {
        return val
          .flatMap((v) => (typeof v === 'string' ? v.split(',') : []))
          .map((s) => s.trim())
          .filter(Boolean);
      }
      if (typeof val === 'string') {
        return val
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      }
      return [];
    };

    const brandIds = parseMultiSelect(query.brandIds || query.brandId);
    const createdBys = parseMultiSelect(query.createdBys || query.createdBy);
    const tagErrors = parseMultiSelect(query.tagErrors || query.tagError);

    return this.dataSource.transaction(async (manager) => {
      await this.setRlsContext(manager, userId);

      const qb = manager
        .getRepository(ReplyEntity)
        .createQueryBuilder('reply')
        .leftJoinAndSelect('reply.brand', 'brand')
        .leftJoinAndSelect('reply.specialist', 'specialist')
        .leftJoinAndSelect('reply.evaluations', 'evaluations')
        .leftJoinAndSelect('evaluations.teamLead', 'teamLead');

      // Filter 1: brand (tbrand) - multiselect
      if (brandIds.length > 0) {
        qb.andWhere('reply.brandId IN (:...brandIds)', { brandIds });
      }

      // Filter 2: created_by (treply.created_by) - multiselect
      // Notice: qb.andWhere ensures AND in database between filters
      if (createdBys.length > 0) {
        qb.andWhere('reply.createdBy IN (:...createdBys)', { createdBys });
      }

      // Filter 3: tag_errors (tevaluation.error_tags plus 'Pending' option) - multiselect
      // Notice: qb.andWhere ensures AND in database between all 3 filters
      if (tagErrors.length > 0) {
        const hasPending = tagErrors.some((t) => t.toLowerCase() === 'pending');
        const actualTags = tagErrors.filter((t) => t.toLowerCase() !== 'pending');

        if (hasPending && actualTags.length > 0) {
          qb.andWhere(
            '(evaluations.id IS NULL OR evaluations.errorTags IN (:...actualTags))',
            { actualTags },
          );
        } else if (hasPending) {
          qb.andWhere('evaluations.id IS NULL');
        } else {
          qb.andWhere('evaluations.errorTags IN (:...actualTags)', { actualTags });
        }
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
