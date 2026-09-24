import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { EvaluationEntity } from './entities/evaluation.entity';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { UpdateEvaluationDto } from './dto/update-evaluation.dto';
import { IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class EvaluationFilterQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  replyId?: string;

  @IsOptional()
  @IsUUID()
  teamLeadId?: string;
}

@Injectable()
export class EvaluationService {
  constructor(
    private readonly dataSource: DataSource,
  ) {}

  private async setRlsContext(manager: EntityManager, userId?: string): Promise<void> {
    await manager.query(`SET LOCAL ROLE authenticated`);
    await manager.query(`SELECT set_config('app.current_user_id', $1, true)`, [userId || '']);
  }

  async getTagErrorOptions(userId?: string): Promise<string[]> {
    return this.dataSource.transaction(async (manager) => {
      await this.setRlsContext(manager, userId);
      const results = await manager
        .getRepository(EvaluationEntity)
        .createQueryBuilder('eval')
        .select('DISTINCT eval.errorTags', 'errorTags')
        .where('eval.errorTags IS NOT NULL AND eval.errorTags != \'\'')
        .getRawMany();

      const existingTags = results.map((r) => r.errorTags).filter(Boolean);
      const standardTags = [
        'Grammar & Syntax',
        'Tone Unsuitable',
        'Impolite / Harsh',
        'Protocol Deviation',
        'Excessive Verbosity',
        'Condescending Tone',
      ];
      return Array.from(new Set([...standardTags, ...existingTags]));
    });
  }

  async create(dto: CreateEvaluationDto, userId?: string): Promise<EvaluationEntity> {
    return this.dataSource.transaction(async (manager) => {
      await this.setRlsContext(manager, userId);

      const evaluation = manager.getRepository(EvaluationEntity).create({
        replyId: dto.replyId,
        teamLeadId: dto.teamLeadId,
        evaluationDate: new Date(dto.evaluationDate),
        score: dto.score,
        errorTags: dto.errorTags || null,
        feedback: dto.feedback || null,
        createdBy: dto.createdBy || 'system',
        status: dto.status || 'active',
      });

      return manager.getRepository(EvaluationEntity).save(evaluation);
    });
  }

  async findAll(
    query: EvaluationFilterQueryDto,
    userId?: string,
  ): Promise<{
    items: EvaluationEntity[];
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
        .getRepository(EvaluationEntity)
        .createQueryBuilder('eval')
        .leftJoinAndSelect('eval.reply', 'reply')
        .leftJoinAndSelect('eval.teamLead', 'teamLead')
        .leftJoinAndSelect('reply.brand', 'brand')
        .leftJoinAndSelect('reply.specialist', 'specialist');

      if (query.replyId) {
        qb.andWhere('eval.replyId = :replyId', { replyId: query.replyId });
      }

      if (query.teamLeadId) {
        qb.andWhere('eval.teamLeadId = :teamLeadId', { teamLeadId: query.teamLeadId });
      }

      if (query.status) {
        qb.andWhere('eval.status = :status', { status: query.status });
      }

      qb.orderBy('eval.evaluationDate', 'DESC').skip(skip).take(limit);

      const [items, total] = await qb.getManyAndCount();

      return { items, total, page, limit };
    });
  }

  async findOne(id: string, userId?: string): Promise<EvaluationEntity> {
    return this.dataSource.transaction(async (manager) => {
      await this.setRlsContext(manager, userId);

      const evaluation = await manager.getRepository(EvaluationEntity).findOne({
        where: { id },
        relations: ['reply', 'teamLead', 'reply.brand', 'reply.specialist'],
      });

      if (!evaluation) {
        throw new NotFoundException(`Evaluation with ID "${id}" not found.`);
      }

      return evaluation;
    });
  }

  async update(id: string, dto: UpdateEvaluationDto, userId?: string): Promise<EvaluationEntity> {
    return this.dataSource.transaction(async (manager) => {
      await this.setRlsContext(manager, userId);

      const repo = manager.getRepository(EvaluationEntity);
      const evaluation = await repo.findOne({ where: { id } });

      if (!evaluation) {
        throw new NotFoundException(`Evaluation with ID "${id}" not found.`);
      }

      Object.assign(evaluation, {
        ...dto,
        evaluationDate: dto.evaluationDate ? new Date(dto.evaluationDate) : evaluation.evaluationDate,
        updatedBy: dto.updatedBy || 'system',
      });

      return repo.save(evaluation);
    });
  }

  async remove(id: string, userId?: string): Promise<{ deleted: true; id: string }> {
    return this.dataSource.transaction(async (manager) => {
      await this.setRlsContext(manager, userId);

      const repo = manager.getRepository(EvaluationEntity);
      const evaluation = await repo.findOne({ where: { id } });

      if (!evaluation) {
        throw new NotFoundException(`Evaluation with ID "${id}" not found.`);
      }

      await repo.remove(evaluation);
      return { deleted: true, id };
    });
  }
}
