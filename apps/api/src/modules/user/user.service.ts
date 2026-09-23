import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async create(dto: CreateUserDto): Promise<UserEntity> {
    const existing = await this.userRepository.findOne({
      where: { account: dto.account },
    });
    if (existing) {
      throw new ConflictException(`User with account "${dto.account}" already exists.`);
    }

    const user = this.userRepository.create({
      account: dto.account,
      name: dto.name,
      role: dto.role,
      createdBy: dto.createdBy || 'system',
      status: dto.status || 'active',
    });

    return this.userRepository.save(user);
  }

  async findAll(query: PaginationQueryDto): Promise<{ items: UserEntity[]; total: number; page: number; limit: number }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const qb = this.userRepository.createQueryBuilder('user');

    if (query.status) {
      qb.andWhere('user.status = :status', { status: query.status });
    }

    if (query.search) {
      qb.andWhere('(user.name ILIKE :search OR user.account ILIKE :search OR user.role ILIKE :search)', {
        search: `%${query.search}%`,
      });
    }

    qb.orderBy('user.createdAt', 'DESC').skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();

    return { items, total, page, limit };
  }

  async findOne(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['brandUsers', 'brandUsers.brand', 'specialistReplies', 'teamLeadEvaluations'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found.`);
    }

    return user;
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserEntity> {
    const user = await this.findOne(id);

    if (dto.account && dto.account !== user.account) {
      const existing = await this.userRepository.findOne({
        where: { account: dto.account },
      });
      if (existing) {
        throw new ConflictException(`User with account "${dto.account}" already exists.`);
      }
    }

    Object.assign(user, {
      ...dto,
      updatedBy: dto.updatedBy || 'system',
    });

    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<{ deleted: true; id: string }> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
    return { deleted: true, id };
  }
}
