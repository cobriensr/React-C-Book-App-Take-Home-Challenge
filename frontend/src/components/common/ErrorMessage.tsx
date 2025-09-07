import React from 'react';
import type { ErrorMessageProps } from '../../types/common';

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => (
  <div className="error-message">
    <p>Error: {message}</p>
    {onRetry && (
      <button onClick={onRetry} className="retry-button">
        Retry
      </button>
    )}
  </div>
);