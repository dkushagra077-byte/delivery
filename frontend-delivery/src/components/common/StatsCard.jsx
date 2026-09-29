import React from 'react';

export const StatsCard = ({
  title,
  value,
  change,
  isPositive = true,
  icon: Icon,
  color = 'primary'
}) => {
  const getColorStyles = () => {
    switch (color) {
      case 'success':
        return {
          glow: 'var(--success-glow)',
          accent: 'var(--success)',
          text: 'var(--success)'
        };
      case 'warning':
        return {
          glow: 'var(--warning-glow)',
          accent: 'var(--warning)',
          text: 'var(--warning)'
        };
      case 'purple':
        return {
          glow: 'var(--purple-glow)',
          accent: 'var(--purple)',
          text: 'var(--purple)'
        };
      default:
        return {
          glow: 'var(--primary-glow)',
          accent: 'var(--primary)',
          text: 'var(--primary)'
        };
    }
  };

  const c = getColorStyles();

  return (
    <div
      className="glass-panel"
      style={{
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {title}
        </span>
        <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
          {value}
        </span>
        {change && (
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: isPositive ? 'var(--success)' : 'var(--danger)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {isPositive ? '↑' : '↓'} {change}
          </span>
        )}
      </div>

      {Icon && (
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: c.glow,
            color: c.accent,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 4px 12px ${c.glow}`
          }}
        >
          <Icon size={24} />
        </div>
      )}
    </div>
  );
};
