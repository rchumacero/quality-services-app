import { useEffect, useState } from 'react';
import { QualityService } from '@quality-services/types';
import { apiClient } from '../lib/apiClient';

export function useServices() {
  const [services, setServices] = useState<QualityService[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchServices() {
      try {
        setLoading(true);
        const res = await apiClient.get<QualityService[]>('/services');
        if (isMounted) {
          setServices(res.data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown error occurred');
          // Provide fallback sample data for demonstration if API is offline
          setServices([
            {
              id: 'sample-1',
              name: 'ISO 9001 Quality Audit',
              description: 'Comprehensive compliance and quality process audit.',
              category: 'audit',
              status: 'active',
              slaHours: 48,
              price: 1200,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: 'sample-2',
              name: 'Seller In-Line Product Inspection',
              description: 'Direct factory line inspection with defect grading.',
              category: 'inspection',
              status: 'active',
              slaHours: 24,
              price: 450,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: 'sample-3',
              name: 'Packaging & Labeling Certification',
              description: 'Verification of export compliance packaging.',
              category: 'certification',
              status: 'in_review',
              slaHours: 72,
              price: 680,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchServices();

    return () => {
      isMounted = false;
    };
  }, []);

  return { services, loading, error };
}
