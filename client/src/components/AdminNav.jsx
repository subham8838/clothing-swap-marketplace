import React from 'react';
import { NavLink } from 'react-router-dom';

const links = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/listings', label: 'Listings' },
  { to: '/admin/reports', label: 'Reports' },
];

const AdminNav = () => (
  <div className="border-b border-moss-100 bg-white">
    <div className="max-w-6xl mx-auto px-6 flex gap-6">
      {links.map((l) => (
        <NavLink key={l.to} to={l.to} end={l.end}
          className={({ isActive }) => `py-3.5 text-sm font-medium border-b-2 ${isActive ? 'border-pine text-pine' : 'border-transparent text-ink/50 hover:text-ink'}`}>
          {l.label}
        </NavLink>
      ))}
    </div>
  </div>
);

export default AdminNav;
