import React from 'react';

/**
 * UI Component: Global Loading Spinner
 * Provides visual feedback during asynchronous operations and route transitions.
 */
const Loading: React.FC = () => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      width: '100%',
      backgroundColor: '#121212',
      color: '#f09433' 
    }}>
      <style>
        {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
      </style>
      <span className="material-icons" style={{ fontSize: '48px', animation: 'spin 1s linear infinite', marginBottom: '16px' }}>
        sync
      </span>
      <span style={{ fontFamily: 'Funnel Sans, sans-serif', color: '#888', fontSize: '0.9rem', letterSpacing: '1px' }}>
        CARREGANDO...
      </span>
    </div>
  );
};

export default Loading;