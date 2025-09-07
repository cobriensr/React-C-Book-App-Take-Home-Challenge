import React from 'react';

interface StatsSummaryProps {
  totalBooks: number;
  averageRating: number;
}

export const StatsSummary: React.FC<StatsSummaryProps> = ({ 
  totalBooks, 
  averageRating 
}) => {
  return (
    <div className="stats-summary">
      <StatCard 
        title="Total Books" 
        value={totalBooks.toString()} 
      />
      <StatCard 
        title="Average Rating" 
        value={`${averageRating.toFixed(1)} ★`} 
      />
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value }) => (
  <div className="stat-card">
    <h3>{title}</h3>
    <p className="stat-value">{value}</p>
  </div>
);