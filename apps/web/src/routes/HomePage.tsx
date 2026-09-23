import React from 'react';
import { useServices } from '../hooks/useServices';
import { ServiceList } from '../features/services/components/ServiceList';

export const HomePage: React.FC = () => {
  const { services, loading, error } = useServices();

  return (
    <main className="container mx-auto px-4 md:px-8 py-8 flex-1">
      <div className="hero bg-base-200 rounded-2xl p-8 mb-8 border border-base-300">
        <div className="hero-content text-center">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-extrabold text-base-content tracking-tight">
              Quality Services Platform
            </h1>
            <p className="py-4 text-base-content/80 text-lg">
              Manage quality control audits, product inspections, and compliance certifications with real-time status tracking.
            </p>
            <div className="flex justify-center gap-3">
              <button className="btn btn-primary">Browse Services</button>
              <button className="btn btn-outline">API Docs</button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-warning mb-6">
          <span>Backend offline; displaying cached sample services. ({error})</span>
        </div>
      )}

      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-base-content">Available Services</h2>
            <p className="text-sm text-base-content/60">Standardized quality assurance offerings</p>
          </div>
          <span className="badge badge-primary">{services.length} items</span>
        </div>

        <ServiceList services={services} loading={loading} />
      </section>
    </main>
  );
};
