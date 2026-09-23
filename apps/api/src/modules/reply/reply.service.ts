import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReplyEntity } from './entities/reply.entity';
import { CreateReplyDto } from './dto/create-reply.dto';
import { UpdateReplyDto } from './dto/update-reply.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class ReplyFilterQueryDto extends PaginationQueryDto {
  brandId?: string;
  specialistId?: string;
}

@Injectable()
export class ReplyService {
  constructor(
    @InjectRepository(ReplyEntity)
    private readonly replyRepository: Repository<ReplyEntity>,
  ) {}

  async create(dto: CreateReplyDto): Promise<ReplyEntity> {
    const reply = this.replyRepository.create({
      brandId: dto.brandId,
      specialistId: dto.specialistId,
      replyDate: new Date(dto.replyDate),
      content: dto.content,
      createdBy: dto.createdBy || 'system',
      status: dto.status || 'active',
    });

    return this.replyRepository.save(reply);
  }

  async findAll(query: ReplyFilterQueryDto): Promise<{
    items: ReplyEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const qb = this.replyRepository
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
  }

  async findOne(id: string): Promise<ReplyEntity> {
    const reply = await this.replyRepository.findOne({
      where: { id },
      relations: ['brand', 'specialist', 'evaluations', 'evaluations.teamLead'],
    });

    if (!reply) {
      throw new NotFoundException(`Reply with ID "${id}" not found.`);
    }

    return reply;
  }

  async update(id: string, dto: UpdateReplyDto): Promise<ReplyEntity> {
    const reply = await this.findOne(id);

    Object.assign(reply, {
      ...dto,
      replyDate: dto.replyDate ? new Date(dto.replyDate) : reply.replyDate,
      updatedBy: dto.updatedBy || 'system',
    });

    return this.replyRepository.save(reply);
  }

  async remove(id: string): Promise<{ deleted: true; id: string }> {
    const reply = await this.findOne(id);
    await this.replyRepository.remove(reply);
    return { deleted: true, id };
  }
}
