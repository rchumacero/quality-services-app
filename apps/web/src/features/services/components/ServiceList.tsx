import React from 'react';
import { QualityService } from '@quality-services/types';
import { ServiceCard } from './ServiceCard';

interface ServiceListProps {
  services: QualityService[];
  loading?: boolean;
}

export const ServiceList: React.FC<ServiceListProps> = ({ services, loading }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="alert bg-base-200 border border-base-300">
        <span>No quality services registered yet.</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map((service) => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </div>
  );
};
