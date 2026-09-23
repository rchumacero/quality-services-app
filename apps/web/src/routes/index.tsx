import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { HomePage } from './HomePage';
import { NotFoundPage } from './NotFoundPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/services" element={<HomePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
