import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EvaluationEntity } from './entities/evaluation.entity';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { UpdateEvaluationDto } from './dto/update-evaluation.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class EvaluationFilterQueryDto extends PaginationQueryDto {
  replyId?: string;
  teamLeadId?: string;
}

@Injectable()
export class EvaluationService {
  constructor(
    @InjectRepository(EvaluationEntity)
    private readonly evaluationRepository: Repository<EvaluationEntity>,
  ) {}

  async create(dto: CreateEvaluationDto): Promise<EvaluationEntity> {
    const evaluation = this.evaluationRepository.create({
      replyId: dto.replyId,
      teamLeadId: dto.teamLeadId,
      evaluationDate: new Date(dto.evaluationDate),
      score: dto.score,
      errorTags: dto.errorTags || null,
      feedback: dto.feedback || null,
      createdBy: dto.createdBy || 'system',
      status: dto.status || 'active',
    });

    return this.evaluationRepository.save(evaluation);
  }

  async findAll(query: EvaluationFilterQueryDto): Promise<{
    items: EvaluationEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const qb = this.evaluationRepository
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

    if (query.search) {
      qb.andWhere('(eval.feedback ILIKE :search OR eval.errorTags ILIKE :search)', {
        search: `%${query.search}%`,
      });
    }

    qb.orderBy('eval.evaluationDate', 'DESC').skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();

    return { items, total, page, limit };
  }

  async findOne(id: string): Promise<EvaluationEntity> {
    const evaluation = await this.evaluationRepository.findOne({
      where: { id },
      relations: ['reply', 'reply.brand', 'reply.specialist', 'teamLead'],
    });

    if (!evaluation) {
      throw new NotFoundException(`Evaluation with ID "${id}" not found.`);
    }

    return evaluation;
  }

  async update(id: string, dto: UpdateEvaluationDto): Promise<EvaluationEntity> {
    const evaluation = await this.findOne(id);

    Object.assign(evaluation, {
      ...dto,
      evaluationDate: dto.evaluationDate ? new Date(dto.evaluationDate) : evaluation.evaluationDate,
      updatedBy: dto.updatedBy || 'system',
    });

    return this.evaluationRepository.save(evaluation);
  }

  async remove(id: string): Promise<{ deleted: true; id: string }> {
    const evaluation = await this.findOne(id);
    await this.evaluationRepository.remove(evaluation);
    return { deleted: true, id };
  }
}
