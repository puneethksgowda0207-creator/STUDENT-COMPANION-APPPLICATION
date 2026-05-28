import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowRight } from 'lucide-react';

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="welcome-container">
      <div className="welcome-logo">
        <GraduationCap size={80} />
      </div>
      <h1 className="welcome-title">Student Companion App</h1>
      <p className="welcome-subtitle">
        Your unified portal for notices, exams, assignments, and peer connections. 
        Streamlining the college experience for both students and staff.
      </p>
      
      <button 
        className="btn btn-primary" 
        style={{ width: 'auto', padding: '1rem 3rem', fontSize: '1.1rem' }}
        onClick={() => navigate('/login')}
      >
        Get Started <ArrowRight size={20} style={{ marginLeft: '10px' }} />
      </button>
    </div>
  );
};

export default Welcome;
