import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BrandUserEntity } from './entities/brand-user.entity';
import { CreateBrandUserDto } from './dto/create-brand-user.dto';
import { UpdateBrandUserDto } from './dto/update-brand-user.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class BrandUserFilterQueryDto extends PaginationQueryDto {
  brandId?: string;
  userId?: string;
}

@Injectable()
export class BrandUserService {
  constructor(
    @InjectRepository(BrandUserEntity)
    private readonly brandUserRepository: Repository<BrandUserEntity>,
  ) {}

  async create(dto: CreateBrandUserDto): Promise<BrandUserEntity> {
    const existing = await this.brandUserRepository.findOne({
      where: { brandId: dto.brandId, userId: dto.userId },
    });
    if (existing) {
      throw new ConflictException(
        `User "${dto.userId}" is already assigned to Brand "${dto.brandId}".`,
      );
    }

    const brandUser = this.brandUserRepository.create({
      brandId: dto.brandId,
      userId: dto.userId,
      createdBy: dto.createdBy || 'system',
      status: dto.status || 'active',
    });

    return this.brandUserRepository.save(brandUser);
  }

  async findAll(query: BrandUserFilterQueryDto): Promise<{
    items: BrandUserEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const qb = this.brandUserRepository
      .createQueryBuilder('bu')
      .leftJoinAndSelect('bu.brand', 'brand')
      .leftJoinAndSelect('bu.user', 'user');

    if (query.brandId) {
      qb.andWhere('bu.brandId = :brandId', { brandId: query.brandId });
    }

    if (query.userId) {
      qb.andWhere('bu.userId = :userId', { userId: query.userId });
    }

    if (query.status) {
      qb.andWhere('bu.status = :status', { status: query.status });
    }

    qb.orderBy('bu.createdAt', 'DESC').skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();

    return { items, total, page, limit };
  }

  async findOne(id: string): Promise<BrandUserEntity> {
    const item = await this.brandUserRepository.findOne({
      where: { id },
      relations: ['brand', 'user'],
    });

    if (!item) {
      throw new NotFoundException(`BrandUser assignment with ID "${id}" not found.`);
    }

    return item;
  }

  async update(id: string, dto: UpdateBrandUserDto): Promise<BrandUserEntity> {
    const item = await this.findOne(id);

    if (dto.brandId && dto.userId) {
      const existing = await this.brandUserRepository.findOne({
        where: { brandId: dto.brandId, userId: dto.userId },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('Brand-User assignment already exists.');
      }
    }

    Object.assign(item, {
      ...dto,
      updatedBy: dto.updatedBy || 'system',
    });

    return this.brandUserRepository.save(item);
  }

  async remove(id: string): Promise<{ deleted: true; id: string }> {
    const item = await this.findOne(id);
    await this.brandUserRepository.remove(item);
    return { deleted: true, id };
  }
}
