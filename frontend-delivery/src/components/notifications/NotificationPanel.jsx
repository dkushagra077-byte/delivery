import React from 'react';
import { Bell, CheckCheck, X, AlertTriangle, CheckCircle, Info, Clock } from 'lucide-react';
import { Button } from '../common/Button';

export const NotificationPanel = ({
  isOpen,
  onClose,
  notifications = [],
  onMarkRead,
  onMarkAllRead
}) => {
  if (!isOpen) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'SUCCESS':
        return <CheckCircle size={18} style={{ color: '#10b981' }} />;
      case 'WARNING':
      case 'ALERT':
        return <AlertTriangle size={18} style={{ color: '#f59e0b' }} />;
      default:
        return <Info size={18} style={{ color: '#2563eb' }} />;
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'flex-end'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '400px',
          height: '100%',
          borderRadius: 0,
          borderRight: 'none',
          borderTop: 'none',
          borderBottom: 'none',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.4)',
          background: 'var(--bg-surface)',
          animation: 'slideInRight 0.3s ease-out'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={18} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Notifications</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {notifications.some((n) => !n.is_read) && (
              <Button size="sm" variant="ghost" onClick={onMarkAllRead} icon={CheckCheck}>
                Read All
              </Button>
            )}
            <button
              onClick={onClose}
              style={{
                padding: '6px',
                borderRadius: '8px',
                color: 'var(--text-muted)'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-muted)' }}>
              <Bell size={36} style={{ margin: '0 auto 12px auto', opacity: 0.4 }} />
              <p style={{ fontWeight: 500 }}>No notifications yet</p>
              <p style={{ fontSize: '0.8rem' }}>Live updates for your deliveries will appear here.</p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: '14px',
                  borderRadius: '12px',
                  background: item.is_read ? 'var(--bg-surface-elevated)' : 'rgba(37, 99, 235, 0.08)',
                  border: `1px solid ${item.is_read ? 'var(--border-light)' : 'rgba(37, 99, 235, 0.25)'}`,
                  display: 'flex',
                  gap: '12px',
                  cursor: item.is_read ? 'default' : 'pointer',
                  transition: 'all 0.2s'
                }}
                onClick={() => !item.is_read && onMarkRead && onMarkRead(item.id)}
              >
                <div style={{ marginTop: '2px' }}>{getIcon(item.type)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h4 style={{ fontSize: '0.875rem', margin: 0, fontWeight: item.is_read ? 500 : 700 }}>
                      {item.title}
                    </h4>
                    {!item.is_read && (
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: '#2563eb'
                        }}
                      />
                    )}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 6px 0' }}>
                    {item.message}
                  </p>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>
                    {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
