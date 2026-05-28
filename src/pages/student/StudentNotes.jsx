import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { Book, ExternalLink } from 'lucide-react';
import { SUBJECTS } from '../../utils/constants';

const StudentNotes = ({ userData }) => {
  const [selectedSubject, setSelectedSubject] = useState(SUBJECTS[0]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotes(selectedSubject);
  }, [selectedSubject, userData.semester]);

  const fetchNotes = async (subject) => {
    if (!userData || !userData.semester) return;
    
    setLoading(true);
    setError('');
    
    try {
      const q = query(
        collection(db, 'notes'),
        where('semester', '==', userData.semester),
        where('subject', '==', subject)
      );
      
      const snapshot = await getDocs(q);
      const fetchedNotes = [];
      snapshot.forEach((doc) => {
        fetchedNotes.push({ id: doc.id, ...doc.data() });
      });
      
      // Sort client-side if needed since composite index might be required for orderBy on a different field than where
      fetchedNotes.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
      
      setNotes(fetchedNotes);
    } catch (err) {
      console.error("Error fetching notes:", err);
      setError(`Failed to load notes: ${err.message}`);
    } finally {
      setLoading(false);
    }
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

      {/* Notes Display area */}
      <div style={{ background: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', minHeight: '400px' }}>
        <h3 style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem', marginBottom: '1.5rem', color: 'var(--text-main)' }}>
          {selectedSubject} Notes
        </h3>

        {loading && <p style={{ color: 'var(--text-muted)' }}>Loading notes...</p>}
        {error && <p className="error-message" style={{ color: 'var(--error-red)' }}>{error}</p>}
        
        {!loading && !error && notes.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94A3B8' }}>
            <Book size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>No notes have been uploaded for {selectedSubject} yet.</p>
          </div>
        )}

        <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {notes.map(note => (
            <div key={note.id} style={{ border: '1px solid #E2E8F0', borderRadius: 'var(--radius-md)', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
              <h4 style={{ color: 'var(--primary-blue)', marginBottom: '0.5rem', fontSize: '1.1rem' }}>{note.title}</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem', flex: 1 }}>{note.description}</p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #F1F5F9' }}>
                <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                  By: {note.uploadedBy}
                </span>
                <a 
                  href={note.pdfLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                >
                  Open PDF <ExternalLink size={14} style={{ marginLeft: '6px' }} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentNotes;
