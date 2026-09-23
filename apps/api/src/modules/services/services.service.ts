import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { QualityService } from '@quality-services/types';
import { SupabaseService } from '../../supabase/supabase.service';
import {
  CreateQualityServiceDto,
  ServiceFilterQueryDto,
  UpdateQualityServiceDto,
} from './dto/service.dto';

@Injectable()
export class ServicesService {
  private readonly logger = new Logger(ServicesService.name);

  // In-memory fallback mock database for immediate local scaffolding
  private servicesMock: QualityService[] = [
    {
      id: 'svc-001',
      name: 'ISO 9001 Quality Management Audit',
      description: 'Full systematic audit verifying conformity with ISO 9001 standard procedures.',
      category: 'audit',
      status: 'active',
      slaHours: 48,
      price: 1500,
      createdAt: '2026-01-10T10:00:00Z',
      updatedAt: '2026-01-10T10:00:00Z',
    },
    {
      id: 'svc-002',
      name: 'Pre-Shipment Container Inspection',
      description: 'Random sampling and testing prior to warehouse dispatch to prevent returns.',
      category: 'inspection',
      status: 'active',
      slaHours: 24,
      price: 490,
      createdAt: '2026-01-15T12:30:00Z',
      updatedAt: '2026-01-15T12:30:00Z',
    },
    {
      id: 'svc-003',
      name: 'CE Marking Compliance Verification',
      description: 'Regulatory review of technical files for European market commercialization.',
      category: 'certification',
      status: 'in_review',
      slaHours: 96,
      price: 2100,
      createdAt: '2026-02-01T08:00:00Z',
      updatedAt: '2026-02-01T08:00:00Z',
    },
    {
      id: 'svc-004',
      name: 'Supplier Quality Engineering Consulting',
      description: 'Dedicated QE specialist support for root cause analysis and CAPA implementation.',
      category: 'consulting',
      status: 'active',
      slaHours: 72,
      price: 3200,
      createdAt: '2026-02-10T14:00:00Z',
      updatedAt: '2026-02-10T14:00:00Z',
    },
  ];

  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(filters?: ServiceFilterQueryDto): Promise<QualityService[]> {
    try {
      const client = this.supabaseService.getClient();
      let query = client.from('quality_services').select('*');

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        this.logger.warn(`Supabase query failed (${error.message}). Using local store.`);
        return this.filterMockServices(filters);
      }

      return (data as QualityService[]) || this.filterMockServices(filters);
    } catch {
      return this.filterMockServices(filters);
    }
  }

  async findOne(id: string): Promise<QualityService> {
    try {
      const client = this.supabaseService.getClient();
      const { data, error } = await client
        .from('quality_services')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        return this.findOneMock(id);
      }

      return data as QualityService;
    } catch {
      return this.findOneMock(id);
    }
  }

  async create(dto: CreateQualityServiceDto): Promise<QualityService> {
    const newService: QualityService = {
      id: `svc-${Date.now().toString(36)}`,
      name: dto.name,
      description: dto.description,
      category: dto.category,
      status: dto.status || 'active',
      slaHours: dto.slaHours,
      price: dto.price,
      metadata: dto.metadata,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const client = this.supabaseService.getClient();
      const { data, error } = await client
        .from('quality_services')
        .insert(newService)
        .select()
        .single();

      if (!error && data) {
        return data as QualityService;
      }
    } catch {
      // Fallback to in-memory store
    }

    this.servicesMock.push(newService);
    return newService;
  }

  async update(id: string, dto: UpdateQualityServiceDto): Promise<QualityService> {
    const existing = await this.findOne(id);

    const updated: QualityService = {
      ...existing,
      ...dto,
      updatedAt: new Date().toISOString(),
    };

    try {
      const client = this.supabaseService.getClient();
      const { data, error } = await client
        .from('quality_services')
        .update(updated)
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        return data as QualityService;
      }
    } catch {
      // Fallback
    }

    const index = this.servicesMock.findIndex((s) => s.id === id);
    if (index !== -1) {
      this.servicesMock[index] = updated;
    }
    return updated;
  }

  async remove(id: string): Promise<{ deleted: true; id: string }> {
    await this.findOne(id);

    try {
      const client = this.supabaseService.getClient();
      await client.from('quality_services').delete().eq('id', id);
    } catch {
      // Fallback
    }

    this.servicesMock = this.servicesMock.filter((s) => s.id !== id);
    return { deleted: true, id };
  }

  private filterMockServices(filters?: ServiceFilterQueryDto): QualityService[] {
    let result = [...this.servicesMock];

    if (filters?.category) {
      result = result.filter((s) => s.category === filters.category);
    }
    if (filters?.status) {
      result = result.filter((s) => s.status === filters.status);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q),
      );
    }

    return result;
  }

  private findOneMock(id: string): QualityService {
    const found = this.servicesMock.find((s) => s.id === id);
    if (!found) {
      throw new NotFoundException(`QualityService with ID "${id}" not found`);
    }
    return found;
  }
}
