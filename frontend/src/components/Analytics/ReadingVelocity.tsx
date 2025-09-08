// frontend/src/components/Analytics/ReadingVelocity.tsx

import React from 'react';
import type { ReadingVelocityProps } from '../../types/common';

export const ReadingVelocity: React.FC<ReadingVelocityProps> = ({ velocity }) => {
  const metrics = [
    {
      label: 'Books per Month',
      value: velocity.booksPerMonth.toFixed(1),
    },
    {
      label: 'Pages per Day',
      value: velocity.pagesPerDay.toFixed(0),
    },
    {
      label: 'Avg Read Time',
      value: `${velocity.averageReadTime} days`,
    },
  ];

  return (
    <div className="reading-velocity-card">
      <h3>📖 Reading Velocity</h3>
      <div className="velocity-metrics">
        {metrics.map((metric, index) => (
          <div key={index} className="velocity-item">
            <span className="velocity-label">{metric.label}</span>
            <span className="velocity-value">{metric.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};