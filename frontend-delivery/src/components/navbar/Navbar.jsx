import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Truck,
  Sun,
  Moon,
  Mic,
  Bell,
  LogOut,
  User as UserIcon,
  Shield,
  Navigation
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Badge } from '../common/Badge';

export const Navbar = ({ onOpenVoice, onOpenNotifications, unreadCount = 0 }) => {
  const { user, isDriver, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header
      className="glass-panel"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        height: 'var(--navbar-height)',
        borderRadius: 0,
        borderLeft: 'none',
        borderRight: 'none',
        borderTop: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px'
      }}
    >
      {/* Brand Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)'
          }}
        >
          <Truck size={22} />
        </div>
        <div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.03em', fontFamily: 'var(--font-display)' }}>
            Drop<span style={{ color: '#2563eb' }}>Pulse</span>
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '-2px' }}>
            <span
              className="animate-pulse-glow"
              style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }}
            />
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Fleet Live
            </span>
          </div>
        </div>
      </Link>

      {/* Center Nav Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {user && (
          <Badge variant={isAdmin ? 'purple' : isDriver ? 'warning' : 'info'}>
            {user.role}
          </Badge>
        )}
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Voice Assistant Button */}
        <button
          onClick={onOpenVoice}
          title="Open Voice Assistant"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 14px',
            borderRadius: 'var(--radius-full)',
            background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.15), rgba(6, 182, 212, 0.15))',
            border: '1px solid rgba(37, 99, 235, 0.3)',
            color: 'var(--text-main)',
            fontSize: '0.85rem',
            fontWeight: 600,
            transition: 'all 0.2s'
          }}
        >
          <Mic size={16} style={{ color: '#06b6d4' }} />
          <span className="hide-mobile">Voice AI</span>
        </button>

        {/* Notifications Bell */}
        <button
          onClick={onOpenNotifications}
          title="Notifications"
          style={{
            position: 'relative',
            padding: '10px',
            borderRadius: '10px',
            background: 'var(--bg-surface-elevated)',
            color: 'var(--text-main)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--border-light)'
          }}
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: '#ef4444',
                color: '#ffffff',
                fontSize: '0.65rem',
                fontWeight: 700,
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(239, 68, 68, 0.5)'
              }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          style={{
            padding: '10px',
            borderRadius: '10px',
            background: 'var(--bg-surface-elevated)',
            color: 'var(--text-main)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--border-light)'
          }}
        >
          {theme === 'dark' ? <Sun size={18} style={{ color: '#fbbf24' }} /> : <Moon size={18} />}
        </button>

        {/* User Profile Dropdown */}
        {user ? (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                borderRadius: '10px',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-light)',
                color: 'var(--text-main)'
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: '#2563eb',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.8rem'
                }}
              >
                {user.full_name?.charAt(0) || 'U'}
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.full_name?.split(' ')[0]}</span>
            </button>

            {dropdownOpen && (
              <div
                className="glass-panel"
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 8px)',
                  minWidth: '200px',
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  zIndex: 100,
                  boxShadow: 'var(--shadow-xl)',
                  background: 'var(--bg-surface)'
                }}
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.full_name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
                </div>

                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    color: 'var(--danger)',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    width: '100%',
                    textAlign: 'left'
                  }}
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              background: '#2563eb',
              color: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: 600
            }}
          >
            Log In
          </Link>
        )}
      </div>
    </header>
  );
};
