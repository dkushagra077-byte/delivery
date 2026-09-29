import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  PackagePlus,
  Navigation,
  Clock,
  MapPin,
  Users,
  Shield,
  Truck,
  Settings,
  Activity
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = () => {
  const { user, isCustomer, isDriver, isAdmin } = useAuth();

  const customerLinks = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/orders/new', label: 'Create Order', icon: PackagePlus },
    { to: '/orders/history', label: 'Order History', icon: Clock },
    { to: '/addresses', label: 'Saved Addresses', icon: MapPin },
    { to: '/profile', label: 'My Profile', icon: Settings }
  ];

  const driverLinks = [
    { to: '/', label: 'Driver Dashboard', icon: Truck },
    { to: '/driver/deliveries', label: 'My Deliveries', icon: Navigation },
    { to: '/driver/history', label: 'Completed Deliveries', icon: Clock },
    { to: '/profile', label: 'Vehicle Profile', icon: Settings }
  ];

  const adminLinks = [
    { to: '/', label: 'Admin Fleet Overview', icon: LayoutDashboard },
    { to: '/admin/deliveries', label: 'Deliveries Dispatch', icon: Navigation },
    { to: '/admin/drivers', label: 'Driver Fleet', icon: Truck },
    { to: '/admin/users', label: 'User Directory', icon: Users },
    { to: '/profile', label: 'Settings', icon: Settings }
  ];

  const links = isDriver ? driverLinks : isAdmin ? adminLinks : customerLinks;

  return (
    <aside
      className="glass-panel"
      style={{
        width: 'var(--sidebar-width)',
        borderRadius: 0,
        borderTop: 'none',
        borderLeft: 'none',
        borderBottom: 'none',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        gap: '24px'
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <span
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            paddingLeft: '12px'
          }}
        >
          Navigation
        </span>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  fontSize: '0.9rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#ffffff' : 'var(--text-muted)',
                  background: isActive
                    ? 'linear-gradient(135deg, #2563eb, #1d4ed8)'
                    : 'transparent',
                  boxShadow: isActive ? '0 4px 12px rgba(37, 99, 235, 0.3)' : 'none',
                  transition: 'all 0.2s'
                })}
              >
                <Icon size={18} />
                {link.label}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Role Card Banner */}
      <div
        style={{
          marginTop: 'auto',
          padding: '14px',
          background: 'var(--bg-surface-elevated)',
          borderRadius: '12px',
          border: '1px solid var(--border-light)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10b981'
            }}
            className="animate-pulse-glow"
          />
          <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Active Role</span>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
          Logged in as <b>{user?.role}</b> ({user?.email})
        </p>
      </div>
    </aside>
  );
};
