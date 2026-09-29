import React from 'react';

export const Input = ({
  label,
  error,
  helperText,
  icon: Icon,
  className = '',
  style = {},
  ...props
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      {label && (
        <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-main)' }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {Icon && (
          <div style={{
            position: 'absolute',
            left: '12px',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            pointerEvents: 'none'
          }}>
            <Icon size={18} />
          </div>
        )}
        <input
          style={{
            width: '100%',
            padding: Icon ? '10px 14px 10px 40px' : '10px 14px',
            background: 'var(--bg-surface-elevated)',
            border: `1px solid ${error ? 'var(--danger)' : 'var(--border-light)'}`,
            borderRadius: '10px',
            color: 'var(--text-main)',
            fontSize: '0.9rem',
            outline: 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            ...style
          }}
          className={`app-input ${className}`}
          {...props}
        />
      </div>
      {error ? (
        <span style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 500 }}>{error}</span>
      ) : helperText ? (
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{helperText}</span>
      ) : null}
    </div>
  );
};
