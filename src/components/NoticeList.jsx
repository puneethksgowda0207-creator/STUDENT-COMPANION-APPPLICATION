import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Bell, ExternalLink } from 'lucide-react';

const NoticeList = ({ collectionName, title }) => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotices();
  }, [collectionName]);

  const fetchNotices = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Sorting by createdAt assuming we don't have complex composite indexes yet
      const q = query(
        collection(db, collectionName)
      );
      
      const snapshot = await getDocs(q);
      const fetchedNotices = [];
      snapshot.forEach((doc) => {
        fetchedNotices.push({ id: doc.id, ...doc.data() });
      });
      
      // Sort client-side descending by createdAt
      fetchedNotices.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      
      setNotices(fetchedNotices);
    } catch (err) {
      console.error(`Error fetching ${collectionName}:`, err);
      setError(`Failed to load notices: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate();
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ background: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', minHeight: '400px' }}>
      <h2 style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem', marginBottom: '1.5rem', color: 'var(--primary-blue)' }}>
        {title}
      </h2>

      {loading && <p style={{ color: 'var(--text-muted)' }}>Loading {title.toLowerCase()}...</p>}
      {error && <p className="error-message" style={{ color: 'var(--error-red)' }}>{error}</p>}
      
      {!loading && !error && notices.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94A3B8' }}>
          <Bell size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <p>No {title.toLowerCase()} found.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {notices.map(notice => (
          <div key={notice.id} style={{ 
            border: '1px solid #E2E8F0', 
            borderLeft: '4px solid var(--accent-blue)',
            borderRadius: 'var(--radius-md)', 
            padding: '1.5rem',
            backgroundColor: 'var(--off-white)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <h3 style={{ color: 'var(--text-main)', fontSize: '1.15rem', margin: 0 }}>{notice.title}</h3>
              <span style={{ fontSize: '0.8rem', color: '#64748B', whiteSpace: 'nowrap', marginLeft: '1rem' }}>
                {formatDate(notice.createdAt)}
              </span>
            </div>
            
            {notice.noticeType === 'text' ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '1rem', whiteSpace: 'pre-wrap' }}>
                {notice.message}
              </p>
            ) : (
              <div style={{ marginTop: '1rem' }}>
                <a 
                  href={notice.driveLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                >
                  Open Notice <ExternalLink size={14} style={{ marginLeft: '6px' }} />
                </a>
              </div>
            )}
            
            <div style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: '#94A3B8' }}>
              Posted by: {notice.uploadedBy}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NoticeList;
