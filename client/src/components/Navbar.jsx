import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Shirt, Bell, Menu, X, User as UserIcon, LogOut, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

const navLinkClass = ({ isActive }) =>
  `text-sm font-medium transition-colors ${isActive ? 'text-pine' : 'text-ink/60 hover:text-pine'}`;

const Navbar = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-paper/95 backdrop-blur border-b border-moss-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display text-xl text-pine">
          <Shirt size={22} strokeWidth={1.75} />
          Reweave
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          <NavLink to="/listings" className={navLinkClass}>Browse</NavLink>
          {user && <NavLink to="/dashboard" className={navLinkClass}>Dashboard</NavLink>}
          {user && <NavLink to="/swaps" className={navLinkClass}>My Swaps</NavLink>}
          {user && <NavLink to="/listings/create" className={navLinkClass}>List an Item</NavLink>}
          {user?.role === 'admin' && <NavLink to="/admin" className={navLinkClass}>Admin</NavLink>}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <Link to="/notifications" className="relative text-ink/60 hover:text-pine">
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-thread text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
              <Link to={`/profile/${user._id}`} className="text-ink/60 hover:text-pine">
                <UserIcon size={20} />
              </Link>
              <button onClick={handleLogout} className="text-ink/60 hover:text-thread" title="Log out">
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-ink/70 hover:text-pine">Log in</Link>
              <Link to="/register" className="bg-pine text-paper text-sm font-medium px-4 py-2 rounded-full hover:bg-pine-700 transition-colors">
                Start Swapping
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden text-ink" onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-moss-100 bg-paper px-4 py-4 flex flex-col gap-4">
          <NavLink to="/listings" className={navLinkClass} onClick={() => setOpen(false)}>Browse</NavLink>
          {user && <NavLink to="/dashboard" className={navLinkClass} onClick={() => setOpen(false)}><LayoutDashboard size={16} className="inline mr-1" />Dashboard</NavLink>}
          {user && <NavLink to="/swaps" className={navLinkClass} onClick={() => setOpen(false)}>My Swaps</NavLink>}
          {user && <NavLink to="/listings/create" className={navLinkClass} onClick={() => setOpen(false)}>List an Item</NavLink>}
          {user && <NavLink to="/notifications" className={navLinkClass} onClick={() => setOpen(false)}>Notifications {unreadCount > 0 && `(${unreadCount})`}</NavLink>}
          {user && <NavLink to={`/profile/${user._id}`} className={navLinkClass} onClick={() => setOpen(false)}>Profile</NavLink>}
          {user?.role === 'admin' && <NavLink to="/admin" className={navLinkClass} onClick={() => setOpen(false)}><ShieldCheck size={16} className="inline mr-1" />Admin</NavLink>}
          {user ? (
            <button onClick={handleLogout} className="text-left text-thread text-sm font-medium">Log out</button>
          ) : (
            <>
              <NavLink to="/login" className={navLinkClass} onClick={() => setOpen(false)}>Log in</NavLink>
              <NavLink to="/register" className={navLinkClass} onClick={() => setOpen(false)}>Register</NavLink>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
