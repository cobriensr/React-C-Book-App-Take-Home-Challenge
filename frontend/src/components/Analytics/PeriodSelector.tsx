// frontend/src/components/Analytics/PeriodSelector.tsx

import React from 'react';
import type { PeriodSelectorProps } from '../../types/common';

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({ 
  selectedPeriod, 
  onPeriodChange 
}) => {
  return (
    <div className="period-selector">
      <label htmlFor="period-select">View trends for:</label>
      <select 
        id="period-select"
        value={selectedPeriod} 
        onChange={(e) => onPeriodChange(e.target.value as 'week' | 'month' | 'year')}
      >
        <option value="week">Last Week</option>
        <option value="month">Last Month</option>
        <option value="year">Last Year</option>
      </select>
    </div>
  );
};