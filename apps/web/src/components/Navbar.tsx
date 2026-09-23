import React from 'react';
import { Link } from 'react-router-dom';

export const Navbar: React.FC = () => {
  return (
    <header className="navbar bg-base-100 border-b border-base-200 px-4 md:px-8 shadow-sm">
      <div className="navbar-start">
        <Link to="/" className="btn btn-ghost text-xl font-bold tracking-tight text-primary">
          Quality Services
        </Link>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 font-medium space-x-1">
          <li>
            <Link to="/">Dashboard</Link>
          </li>
          <li>
            <Link to="/services">Services Catalog</Link>
          </li>
        </ul>
      </div>
      <div className="navbar-end space-x-2">
        <div className="badge badge-outline badge-primary">Monorepo v0.1</div>
      </div>
    </header>
  );
};
