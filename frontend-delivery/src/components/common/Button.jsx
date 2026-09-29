import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon,
  className = '',
  style = {},
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
          color: '#ffffff',
          boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        };
      case 'success':
        return {
          background: 'linear-gradient(135deg, #10b981, #059669)',
          color: '#ffffff',
          boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        };
      case 'danger':
        return {
          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
          color: '#ffffff',
          boxShadow: '0 4px 14px rgba(239, 68, 68, 0.35)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        };
      case 'secondary':
        return {
          background: 'var(--bg-surface-elevated)',
          color: 'var(--text-main)',
          border: '1px solid var(--border-light)'
        };
      case 'outline':
        return {
          background: 'transparent',
          color: 'var(--text-main)',
          border: '1px solid var(--border-light)'
        };
      case 'ghost':
        return {
          background: 'transparent',
          color: 'var(--text-main)'
        };
      default:
        return {};
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { padding: '6px 12px', fontSize: '0.8rem', borderRadius: '8px' };
      case 'lg':
        return { padding: '14px 28px', fontSize: '1.05rem', borderRadius: '14px', fontWeight: 600 };
      default:
        return { padding: '10px 20px', fontSize: '0.9rem', borderRadius: '10px', fontWeight: 500 };
    }
  };

  return (
    <button
      disabled={disabled || isLoading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontFamily: 'inherit',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: disabled || isLoading ? 0.6 : 1,
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
        ...getVariantStyles(),
        ...getSizeStyles(),
        ...style
      }}
      className={`app-button ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 size={size === 'sm' ? 14 : 18} className="animate-spin" />
      ) : Icon ? (
        <Icon size={size === 'sm' ? 14 : 18} />
      ) : null}
      {children}
    </button>
  );
};
