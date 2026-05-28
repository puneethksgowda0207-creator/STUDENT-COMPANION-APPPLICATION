import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { BookOpen, ExternalLink, Calendar } from 'lucide-react';
import { SUBJECTS } from '../../utils/constants';

const StudentAssignments = ({ userData }) => {
  const [selectedSubject, setSelectedSubject] = useState(SUBJECTS[0]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAssignments(selectedSubject);
  }, [selectedSubject, userData.semester]);

  const fetchAssignments = async (subject) => {
    if (!userData || !userData.semester) return;
    
    setLoading(true);
    setError('');
    
    try {
      const q = query(
        collection(db, 'assignments'),
        where('semester', '==', userData.semester),
        where('subject', '==', subject)
      );
      
      const snapshot = await getDocs(q);
      const fetched = [];
      snapshot.forEach((doc) => {
        fetched.push({ id: doc.id, ...doc.data() });
      });
      
      fetched.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      
      setAssignments(fetched);
    } catch (err) {
      console.error("Error fetching assignments:", err);
      setError(`Failed to load assignments: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Just now';
    return timestamp.toDate().toLocaleDateString();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Subject Selector */}
      <div>
        <h2 style={{ color: 'var(--primary-blue)', marginBottom: '1rem' }}>Semester {userData.semester} Subjects</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {SUBJECTS.map(subject => (
            <button
              key={subject}
              onClick={() => setSelectedSubject(subject)}
              className="btn"
              style={{
                width: 'auto',
                backgroundColor: selectedSubject === subject ? 'var(--primary-blue)' : 'white',
                color: selectedSubject === subject ? 'white' : 'var(--text-main)',
                border: `2px solid ${selectedSubject === subject ? 'var(--primary-blue)' : '#CBD5E1'}`,
                padding: '0.5rem 1.5rem',
                borderRadius: 'var(--radius-lg)'
              }}
            >
              {subject}
            </button>
          ))}
        </div>
      </div>

      {/* Assignments Display area */}
      <div style={{ background: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', minHeight: '400px' }}>
        <h3 style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem', marginBottom: '1.5rem', color: 'var(--text-main)' }}>
          {selectedSubject} Assignments
        </h3>

        {loading && <p style={{ color: 'var(--text-muted)' }}>Loading assignments...</p>}
        {error && <p className="error-message" style={{ color: 'var(--error-red)' }}>{error}</p>}
        
        {!loading && !error && assignments.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94A3B8' }}>
            <BookOpen size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>No assignments posted for {selectedSubject} yet.</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {assignments.map(item => (
            <div key={item.id} style={{ 
              border: '1px solid #E2E8F0', 
              borderLeft: '4px solid #E53E3E',
              borderRadius: 'var(--radius-md)', 
              padding: '1.5rem',
              backgroundColor: 'var(--off-white)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <h3 style={{ color: 'var(--text-main)', fontSize: '1.15rem', margin: 0 }}>{item.title}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#E53E3E', backgroundColor: 'rgba(229, 62, 62, 0.1)', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.85rem', fontWeight: '500' }}>
                  <Calendar size={14} />
                  Due: {item.deadline}
                </div>
              </div>
              
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '1rem', whiteSpace: 'pre-wrap' }}>
                {item.description}
              </p>
              
              {item.assignmentType === 'image' && (
                <div style={{ marginTop: '1.5rem' }}>
                  <a 
                    href={item.driveLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                  >
                    Open Assignment <ExternalLink size={14} style={{ marginLeft: '6px' }} />
                  </a>
                </div>
              )}
              
              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0', fontSize: '0.75rem', color: '#94A3B8', display: 'flex', justifyContent: 'space-between' }}>
                <span>Posted by: {item.uploadedByEmail}</span>
                <span>Uploaded: {formatDate(item.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentAssignments;
