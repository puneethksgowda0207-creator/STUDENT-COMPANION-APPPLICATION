import React from 'react';

const StaffHome = ({ userData }) => {
  return (
    <div>
      <div className="welcome-banner" style={{ borderLeft: '5px solid var(--accent-blue)' }}>
        <h1 style={{ color: 'var(--primary-blue)', marginBottom: '0.5rem' }}>
          Welcome back, Staff Member!
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Manage resources, uploads, and peer interactions from here.
        </p>
      </div>
      
      <div style={{ background: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-main)' }}>Your Details</h2>
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Email</p>
            <p style={{ fontWeight: '500', color: 'var(--text-main)' }}>{userData?.email}</p>
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Role</p>
            <p style={{ fontWeight: '500', textTransform: 'capitalize', color: 'var(--text-main)' }}>{userData?.role}</p>
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Staff Code</p>
            <p style={{ fontWeight: '500', color: 'var(--text-main)' }}>{userData?.staffCode}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffHome;
