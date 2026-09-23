import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  check() {
    return {
      status: 'ok',
      service: 'quality-services-api',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
