import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, query, getDocs, deleteDoc, doc, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { Trash2 } from 'lucide-react';
import { SUBJECTS } from '../../utils/constants';

const StaffAssignmentsUpload = ({ userData }) => {
  const [semester, setSemester] = useState('1');
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignmentType, setAssignmentType] = useState('text');
  const [driveLink, setDriveLink] = useState('');
  const [deadline, setDeadline] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchHistory = async () => {
    if (!userData?.email) return;
    setHistoryLoading(true);
    try {
      const q = query(collection(db, 'assignments'), where('uploadedByEmail', '==', userData.email));
      const snapshot = await getDocs(q);
      const fetched = [];
      snapshot.forEach((d) => {
        fetched.push({ id: d.id, ...d.data() });
      });
      // Sort client-side descending by createdAt
      fetched.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setHistory(fetched);
    } catch (err) {
      console.error("Error fetching assignments history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [userData?.email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await addDoc(collection(db, 'assignments'), {
        title,
        description,
        semester: parseInt(semester),
        subject,
        assignmentType,
        driveLink: assignmentType === 'image' ? driveLink : '',
        deadline,
        uploadedByEmail: userData.email,
        createdAt: serverTimestamp()
      });

      setMessage('Assignment uploaded successfully!');
      setTitle('');
      setDescription('');
      setDriveLink('');
      setDeadline('');
      setAssignmentType('text');
      
      fetchHistory();
    } catch (error) {
      console.error("Error uploading assignment:", error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this assignment? This action cannot be undone.")) {
      try {
        await deleteDoc(doc(db, 'assignments', id));
        setMessage('Assignment deleted successfully!');
        fetchHistory();
      } catch (err) {
        console.error("Error deleting assignment:", err);
        setMessage(`Error: ${err.message}`);
      }
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Just now';
    return timestamp.toDate().toLocaleDateString();
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Upload Form */}
      <div style={{ background: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
        <h2 style={{ color: 'var(--primary-blue)', marginBottom: '1.5rem' }}>Upload Assignment</h2>
        
        {message && (
          <div className={message.includes('Error') ? "error-message" : "success-message"} style={{ 
            padding: '1rem', 
            marginBottom: '1rem', 
            borderRadius: '4px',
            backgroundColor: message.includes('Error') ? 'rgba(229, 62, 62, 0.1)' : 'rgba(72, 187, 120, 0.1)',
            color: message.includes('Error') ? 'var(--error-red)' : '#2F855A'
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label>Semester</label>
              <select className="form-control" value={semester} onChange={e => setSemester(e.target.value)}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label>Subject</label>
              <select className="form-control" value={subject} onChange={e => setSubject(e.target.value)}>
                {SUBJECTS.map(subj => (
                  <option key={subj} value={subj}>{subj}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Assignment Title</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g. Week 1: Data Structures" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Assignment Type</label>
            <select 
              className="form-control" 
              value={assignmentType} 
              onChange={e => setAssignmentType(e.target.value)}
            >
              <option value="text">Text Assignment</option>
              <option value="image">Image/PDF Assignment (Drive Link)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Short Description / Instructions</label>
            <textarea 
              className="form-control" 
              placeholder="Provide instructions for the assignment..." 
              rows="3"
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
            />
          </div>

          {assignmentType === 'image' && (
            <div className="form-group" style={{ animation: 'fadeIn 0.3s' }}>
              <label>Google Drive PDF/Image Link</label>
              <input 
                type="url" 
                className="form-control" 
                placeholder="https://drive.google.com/file/d/..." 
                value={driveLink}
                onChange={e => setDriveLink(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>Deadline / Submission Date</label>
            <input 
              type="date" 
              className="form-control" 
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Uploading...' : 'Publish Assignment'}
          </button>
        </form>
      </div>

      {/* History Section */}
      <div style={{ background: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
        <h3 style={{ color: 'var(--text-main)', marginBottom: '1.5rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.5rem' }}>Your Assignment Uploads</h3>
        
        {historyLoading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading history...</p>
        ) : history.length === 0 ? (
          <p style={{ color: '#94A3B8', textAlign: 'center', padding: '2rem 0' }}>No assignments uploaded yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {history.map((item) => (
              <div key={item.id} style={{ 
                border: '1px solid #E2E8F0', 
                borderRadius: 'var(--radius-md)', 
                padding: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                backgroundColor: 'var(--off-white)'
              }}>
                <div style={{ flex: 1, paddingRight: '1rem' }}>
                  <h4 style={{ color: 'var(--primary-blue)', margin: '0 0 0.5rem 0', fontSize: '1.05rem' }}>{item.title}</h4>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 500 }}>Sem {item.semester} • {item.subject}</span>
                    <span>Type: {item.assignmentType}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                     <span style={{ color: '#E53E3E', fontWeight: '500' }}>Deadline: {item.deadline}</span>
                     <span style={{ color: '#64748B' }}>Uploaded: {formatDate(item.createdAt)}</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="btn"
                  style={{ 
                    backgroundColor: 'rgba(229, 62, 62, 0.1)', 
                    color: 'var(--error-red)', 
                    width: 'auto', 
                    padding: '0.5rem',
                    border: '1px solid rgba(229, 62, 62, 0.2)' 
                  }}
                  title="Delete Assignment"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default StaffAssignmentsUpload;
