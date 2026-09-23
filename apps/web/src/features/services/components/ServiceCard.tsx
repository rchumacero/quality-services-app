import React from 'react';
import { QualityService } from '@quality-services/types';
import {
  formatCurrency,
  formatSla,
  SERVICE_CATEGORY_LABELS,
  SERVICE_STATUS_BADGE_CLASSES,
  SERVICE_STATUS_LABELS,
} from '@quality-services/utils';

interface ServiceCardProps {
  service: QualityService;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  return (
    <div className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow border border-base-200">
      <div className="card-body p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs uppercase font-semibold tracking-wider text-base-content/60">
            {SERVICE_CATEGORY_LABELS[service.category]}
          </span>
          <span className={SERVICE_STATUS_BADGE_CLASSES[service.status]}>
            {SERVICE_STATUS_LABELS[service.status]}
          </span>
        </div>

        <h3 className="card-title text-lg font-bold mt-1 text-base-content">
          {service.name}
        </h3>
        <p className="text-sm text-base-content/80 line-clamp-2">
          {service.description}
        </p>

        <div className="divider my-2"></div>

        <div className="flex items-center justify-between text-sm">
          <div>
            <span className="text-xs text-base-content/60 block">SLA</span>
            <span className="font-medium">{formatSla(service.slaHours)}</span>
          </div>
          <div className="text-right">
            <span className="text-xs text-base-content/60 block">Base Price</span>
            <span className="text-lg font-bold text-primary">
              {formatCurrency(service.price)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
