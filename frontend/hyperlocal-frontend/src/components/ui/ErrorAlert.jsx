import React from 'react';

/**
 * Reusable error alert component
 */
const ErrorAlert = ({ message }) => {
  if (!message) return null;
  
  return (
    <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg text-red-700 mb-6 flex items-start gap-3" role="alert">
      <span className="material-symbols-outlined text-xl shrink-0 mt-0.5">error</span>
      <div className="flex-1">
        <p className="font-semibold text-sm mb-0.5">Error</p>
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );
};

export default ErrorAlert;
