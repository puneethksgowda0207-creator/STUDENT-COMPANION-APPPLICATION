import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, query, getDocs, deleteDoc, doc, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Trash2 } from 'lucide-react';

const NoticeUpload = ({ collectionName, title, userData }) => {
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeType, setNoticeType] = useState('text'); // 'text' or 'image'
  const [messageText, setMessageText] = useState('');
  const [driveLink, setDriveLink] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const q = query(collection(db, collectionName), where('uploadedByEmail', '==', userData?.email));
      const snapshot = await getDocs(q);
      const fetched = [];
      snapshot.forEach((d) => {
        fetched.push({ id: d.id, ...d.data() });
      });
      // Sort client-side descending by createdAt
      fetched.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setHistory(fetched);
    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [collectionName]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await addDoc(collection(db, collectionName), {
        title: noticeTitle,
        noticeType,
        message: noticeType === 'text' ? messageText : '',
        driveLink: noticeType === 'image' ? driveLink : '',
        uploadedBy: userData?.email || 'Staff',
        uploadedByEmail: userData?.email,
        createdAt: serverTimestamp()
      });

      setMessage('Notice uploaded successfully!');
      setNoticeTitle('');
      setMessageText('');
      setDriveLink('');
      setNoticeType('text');
      
      // Refresh history
      fetchHistory();
    } catch (error) {
      console.error("Error uploading notice:", error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this notice? This action cannot be undone.")) {
      try {
        await deleteDoc(doc(db, collectionName, id));
        setMessage('Notice deleted successfully!');
        fetchHistory(); // refresh list
      } catch (err) {
        console.error("Error deleting notice:", err);
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
        <h2 style={{ color: 'var(--primary-blue)', marginBottom: '1.5rem' }}>{title}</h2>
        
        {message && (
          <div style={{ 
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
          <div className="form-group">
            <label>Notice Title</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g. Upcoming Semester Final Exams" 
              value={noticeTitle}
              onChange={e => setNoticeTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Notice Type</label>
            <select 
              className="form-control" 
              value={noticeType} 
              onChange={e => setNoticeType(e.target.value)}
            >
              <option value="text">Text Notice</option>
              <option value="image">Image/PDF Notice (Google Drive Link)</option>
            </select>
          </div>

          {noticeType === 'text' && (
            <div className="form-group" style={{ animation: 'fadeIn 0.3s' }}>
              <label>Text Message</label>
              <textarea 
                className="form-control" 
                placeholder="Type the notice content here..." 
                rows="5"
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                required
              />
            </div>
          )}

          {noticeType === 'image' && (
            <div className="form-group" style={{ animation: 'fadeIn 0.3s' }}>
              <label>Google Drive Link</label>
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

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Uploading...' : 'Publish Notice'}
          </button>
        </form>
      </div>

      {/* History Section */}
      <div style={{ background: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
        <h3 style={{ color: 'var(--text-main)', marginBottom: '1.5rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.5rem' }}>Upload History</h3>
        
        {historyLoading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading history...</p>
        ) : history.length === 0 ? (
          <p style={{ color: '#94A3B8', textAlign: 'center', padding: '2rem 0' }}>No uploaded notices found.</p>
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
                    <span style={{ fontWeight: 500 }}>Type: {item.noticeType}</span>
                    <span>Date: {formatDate(item.createdAt)}</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '400px', margin: 0 }}>
                    {item.noticeType === 'text' ? item.message : 'Drive Link Attached'}
                  </p>
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
                  title="Delete Notice"
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

export default NoticeUpload;
