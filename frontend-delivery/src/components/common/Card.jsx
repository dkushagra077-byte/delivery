import React from 'react';

export const Card = ({
  children,
  title,
  subtitle,
  action,
  icon: Icon,
  className = '',
  style = {},
  headerStyle = {},
  bodyStyle = {}
}) => {
  return (
    <div
      className={`glass-panel ${className}`}
      style={{
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        ...style
      }}
    >
      {(title || subtitle || action || Icon) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-light)',
            paddingBottom: '14px',
            ...headerStyle
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {Icon && (
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'var(--primary-glow)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Icon size={20} />
              </div>
            )}
            <div>
              {title && <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{title}</h3>}
              {subtitle && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, ...bodyStyle }}>
        {children}
      </div>
    </div>
  );
};
