import React from 'react';
import { Loader2 } from 'lucide-react';

export const Loader = ({ message = 'Loading...', size = 32, fullScreen = false }) => {
  const content = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        padding: '24px',
        color: 'var(--text-muted)'
      }}
    >
      <Loader2
        size={size}
        className="animate-spin"
        style={{ color: 'var(--primary)' }}
      />
      {message && <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'var(--bg-app)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}
      >
        {content}
      </div>
    );
  }

  return content;
};
