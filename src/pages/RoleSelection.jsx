import React, { useState } from 'react';
import { User, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RoleSelection = ({ user, setLocalUserData }) => {
  const [role, setRole] = useState(null); // 'staff' or 'student'
  const [staffCode, setStaffCode] = useState('');
  const [semester, setSemester] = useState('1');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!role) {
      setError('Please select a role');
      return;
    }
    
    setError('');

    if (role === 'staff') {
      // Hardcoded demo staff code
      const DEMO_STAFF_CODE = 'staff123';
      
      if (!staffCode.trim()) {
        setError('Staff code is required');
        return;
      }
      
      if (staffCode.trim() !== DEMO_STAFF_CODE) {
        setError('Invalid staff code. Please try again.');
        return;
      }
    }

    const userData = {
      email: user.email,
      role: role,
      ...(role === 'staff' ? { staffCode: staffCode.trim() } : { semester: parseInt(semester) })
    };

    setLocalUserData(userData);
    
    if (role === 'staff') {
      navigate('/staff-dashboard');
    } else {
      navigate('/student-dashboard');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ maxWidth: '600px' }}>
        <h2>Complete Your Profile</h2>
        <p className="subtitle">Select your role to get started</p>

        <form onSubmit={handleSubmit}>
          <div className="role-options">
            <div 
              className={`role-card ${role === 'student' ? 'selected' : ''}`}
              onClick={() => { setRole('student'); setError(''); }}
            >
              <BookOpen size={32} />
              <span>Student</span>
            </div>
            <div 
              className={`role-card ${role === 'staff' ? 'selected' : ''}`}
              onClick={() => { setRole('staff'); setError(''); }}
            >
              <User size={32} />
              <span>Staff</span>
            </div>
          </div>

          {role === 'staff' && (
            <div className="form-group" style={{ animation: 'fadeIn 0.3s' }}>
              <label>Staff Code</label>
              <input 
                type="text" 
                className="form-control" 
                value={staffCode}
                onChange={(e) => setStaffCode(e.target.value)}
                placeholder="Enter verification code (e.g. staff123)"
                required 
              />
            </div>
          )}

          {role === 'student' && (
            <div className="form-group" style={{ animation: 'fadeIn 0.3s' }}>
              <label>Select Semester</label>
              <select 
                className="form-control" 
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))}
              </select>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}
          
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={!role} 
            style={{ marginTop: '1.5rem' }}
          >
            Complete Setup
          </button>
        </form>
      </div>
    </div>
  );
};

export default RoleSelection;
