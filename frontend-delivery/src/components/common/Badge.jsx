import React from 'react';
import { DELIVERY_STATUSES } from '../../constants';

export const Badge = ({ status, children, variant, className = '', style = {} }) => {
  let colorVariant = variant;
  let labelText = children;

  if (status && DELIVERY_STATUSES[status]) {
    colorVariant = colorVariant || DELIVERY_STATUSES[status].color;
    labelText = labelText || DELIVERY_STATUSES[status].label;
  } else if (!labelText) {
    labelText = status || 'Unknown';
  }

  const badgeClass = `badge badge-${colorVariant || 'info'} ${className}`;

  return (
    <span className={badgeClass} style={style}>
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: 'currentColor'
        }}
      />
      {labelText}
    </span>
  );
};
