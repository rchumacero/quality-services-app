import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="footer footer-center p-4 bg-base-200 text-base-content border-t border-base-300 mt-auto">
      <aside>
        <p className="text-sm text-base-content/70">
          © {new Date().getFullYear()} Quality Services Platform • Built with NestJS, React, Vite & Supabase
        </p>
      </aside>
    </footer>
  );
};
