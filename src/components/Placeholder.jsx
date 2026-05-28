import React from 'react';

const Placeholder = ({ title, description }) => {
  return (
    <div style={{ background: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
      <h2 style={{ color: 'var(--primary-blue)', marginBottom: '1rem' }}>{title}</h2>
      <p style={{ color: 'var(--text-muted)' }}>{description}</p>
      <div style={{ marginTop: '2rem', padding: '3rem', border: '2px dashed #CBD5E1', borderRadius: 'var(--radius-md)', textAlign: 'center', color: '#94A3B8' }}>
        Module functionality will be implemented in a later phase.
      </div>
    </div>
  );
};

export default Placeholder;
