import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BrandEntity } from './entities/brand.entity';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@Injectable()
export class BrandService {
  constructor(
    @InjectRepository(BrandEntity)
    private readonly brandRepository: Repository<BrandEntity>,
  ) {}

  async create(dto: CreateBrandDto): Promise<BrandEntity> {
    const existing = await this.brandRepository.findOne({
      where: { code: dto.code },
    });
    if (existing) {
      throw new ConflictException(`Brand with code "${dto.code}" already exists.`);
    }

    const brand = this.brandRepository.create({
      code: dto.code,
      name: dto.name,
      proceduresSummary: dto.proceduresSummary,
      createdBy: dto.createdBy || 'system',
      status: dto.status || 'active',
    });

    return this.brandRepository.save(brand);
  }

  async findAll(query: PaginationQueryDto): Promise<{ items: BrandEntity[]; total: number; page: number; limit: number }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const qb = this.brandRepository.createQueryBuilder('brand');

    if (query.status) {
      qb.andWhere('brand.status = :status', { status: query.status });
    }

    if (query.search) {
      qb.andWhere('(brand.name ILIKE :search OR brand.code ILIKE :search)', {
        search: `%${query.search}%`,
      });
    }

    qb.orderBy('brand.createdAt', 'DESC').skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();

    return { items, total, page, limit };
  }

  async findOne(id: string): Promise<BrandEntity> {
    const brand = await this.brandRepository.findOne({
      where: { id },
      relations: ['brandUsers', 'brandUsers.user', 'replies'],
    });

    if (!brand) {
      throw new NotFoundException(`Brand with ID "${id}" not found.`);
    }

    return brand;
  }

  async update(id: string, dto: UpdateBrandDto): Promise<BrandEntity> {
    const brand = await this.findOne(id);

    if (dto.code && dto.code !== brand.code) {
      const existing = await this.brandRepository.findOne({
        where: { code: dto.code },
      });
      if (existing) {
        throw new ConflictException(`Brand with code "${dto.code}" already exists.`);
      }
    }

    Object.assign(brand, {
      ...dto,
      updatedBy: dto.updatedBy || 'system',
    });

    return this.brandRepository.save(brand);
  }

  async remove(id: string): Promise<{ deleted: true; id: string }> {
    const brand = await this.findOne(id);
    await this.brandRepository.remove(brand);
    return { deleted: true, id };
  }
}
