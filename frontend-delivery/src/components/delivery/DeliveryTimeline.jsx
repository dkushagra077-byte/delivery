import React from 'react';
import { Check, Clock, CircleAlert } from 'lucide-react';
import { DELIVERY_STATUSES } from '../../constants';

const ORDERED_STEPS = [
  'ORDER_PLACED',
  'ORDER_CONFIRMED',
  'DRIVER_ASSIGNED',
  'PICKED_UP',
  'IN_TRANSIT',
  'NEAR_DESTINATION',
  'OUT_FOR_DELIVERY',
  'DELIVERED'
];

export const DeliveryTimeline = ({ currentStatus, events = [] }) => {
  const currentStepIndex = ORDERED_STEPS.indexOf(currentStatus);
  const isCancelled = currentStatus === 'CANCELLED';
  const isFailed = currentStatus === 'FAILED';

  const findEventTime = (stepKey) => {
    const ev = events.find((e) => e.event_type === stepKey);
    if (!ev) return null;
    return new Date(ev.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {isCancelled && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '10px',
          color: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.9rem',
          fontWeight: 600
        }}>
          <CircleAlert size={18} />
          This delivery has been cancelled.
        </div>
      )}

      {isFailed && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '10px',
          color: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.9rem',
          fontWeight: 600
        }}>
          <CircleAlert size={18} />
          Delivery attempt failed.
        </div>
      )}

      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {ORDERED_STEPS.map((stepKey, idx) => {
          const stepMeta = DELIVERY_STATUSES[stepKey] || { label: stepKey };
          const isCompleted = currentStepIndex > idx || currentStatus === 'DELIVERED';
          const isCurrent = currentStepIndex === idx && !isCancelled && !isFailed;
          const timestamp = findEventTime(stepKey);

          return (
            <div
              key={stepKey}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
                position: 'relative'
              }}
            >
              {/* Connecting Line */}
              {idx < ORDERED_STEPS.length - 1 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '28px',
                    left: '14px',
                    width: '2px',
                    height: 'calc(100% + 4px)',
                    background: isCompleted ? '#2563eb' : 'var(--border-light)',
                    zIndex: 1,
                    transition: 'background 0.3s'
                  }}
                />
              )}

              {/* Step Icon Indicator */}
              <div
                style={{
                  position: 'relative',
                  zIndex: 2,
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isCompleted
                    ? '#2563eb'
                    : isCurrent
                    ? '#10b981'
                    : 'var(--bg-surface-elevated)',
                  border: isCurrent
                    ? '2px solid #ffffff'
                    : isCompleted
                    ? '2px solid #2563eb'
                    : '2px solid var(--border-light)',
                  color: isCompleted || isCurrent ? '#ffffff' : 'var(--text-muted)',
                  boxShadow: isCurrent ? '0 0 14px rgba(16, 185, 129, 0.6)' : 'none',
                  transition: 'all 0.3s'
                }}
                className={isCurrent ? 'animate-pulse-glow' : ''}
              >
                {isCompleted ? (
                  <Check size={16} strokeWidth={3} />
                ) : isCurrent ? (
                  <Clock size={16} strokeWidth={2.5} />
                ) : (
                  <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{idx + 1}</span>
                )}
              </div>

              {/* Step Details */}
              <div style={{ flex: 1, paddingTop: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span
                    style={{
                      fontSize: '0.9rem',
                      fontWeight: isCurrent ? 700 : isCompleted ? 600 : 400,
                      color: isCurrent
                        ? 'var(--text-main)'
                        : isCompleted
                        ? 'var(--text-main)'
                        : 'var(--text-muted)'
                    }}
                  >
                    {stepMeta.label}
                  </span>
                  {timestamp && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                      {timestamp}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
