import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, serverTimestamp, query, getDocs, deleteDoc, doc, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { Trash2, Edit2, Contact, Phone, Mail, Building2 } from 'lucide-react';

const DEPARTMENTS = [
  "Computer Science",
  "Information Technology",
  "Electronics",
  "Mechanical",
  "Civil",
  "Administration",
  "Other"
];

const StaffContacts = ({ userData }) => {
  const [name, setName] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const [editingId, setEditingId] = useState(null);

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchHistory = async () => {
    if (!userData?.email) return;
    setHistoryLoading(true);
    try {
      const q = query(collection(db, 'staff_contacts'), where('uploadedByEmail', '==', userData.email));
      const snapshot = await getDocs(q);
      const fetched = [];
      snapshot.forEach((d) => {
        fetched.push({ id: d.id, ...d.data() });
      });
      // Sort client-side descending by createdAt
      fetched.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setHistory(fetched);
    } catch (err) {
      console.error("Error fetching contacts history:", err);
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
      if (editingId) {
        // Edit mode
        const docRef = doc(db, 'staff_contacts', editingId);
        await updateDoc(docRef, {
          name,
          department,
          phoneNumber,
          email,
        });
        setMessage('Contact updated successfully!');
      } else {
        // Create mode
        await addDoc(collection(db, 'staff_contacts'), {
          name,
          department,
          phoneNumber,
          email,
          uploadedByEmail: userData.email,
          createdAt: serverTimestamp()
        });
        setMessage('Contact added successfully!');
      }

      resetForm();
      fetchHistory();
    } catch (error) {
      console.error("Error saving contact:", error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setName(item.name);
    setDepartment(item.department);
    setPhoneNumber(item.phoneNumber);
    setEmail(item.email || '');
    setMessage('');
    
    // Scroll to top to see form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this contact? This action cannot be undone.")) {
      try {
        await deleteDoc(doc(db, 'staff_contacts', id));
        setMessage('Contact deleted successfully!');
        if (editingId === id) {
          resetForm();
        }
        fetchHistory();
      } catch (err) {
        console.error("Error deleting contact:", err);
        setMessage(`Error: ${err.message}`);
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setDepartment(DEPARTMENTS[0]);
    setPhoneNumber('');
    setEmail('');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Upload/Edit Form */}
      <div style={{ background: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
        <h2 style={{ color: 'var(--primary-blue)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Contact size={24} /> {editingId ? 'Edit Contact Details' : 'Add Contact Details'}
        </h2>
        
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
              <label>Staff Name</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="e.g. Dr. John Doe" 
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label>Department</label>
              <select className="form-control" value={department} onChange={e => setDepartment(e.target.value)}>
                {DEPARTMENTS.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label>Phone Number</label>
              <input 
                type="tel" 
                className="form-control" 
                placeholder="e.g. +1 234 567 8900" 
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label>Email Address (Optional)</label>
              <input 
                type="email" 
                className="form-control" 
                placeholder="e.g. jdoe@college.edu" 
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (editingId ? 'Update Contact' : 'Add Contact')}
            </button>
            {editingId && (
              <button type="button" className="btn" onClick={resetForm} style={{ backgroundColor: '#E2E8F0', color: '#475569' }}>
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      {/* History Section */}
      <div style={{ background: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
        <h3 style={{ color: 'var(--text-main)', marginBottom: '1.5rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.5rem' }}>Your Contact Listings</h3>
        
        {historyLoading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading contacts...</p>
        ) : history.length === 0 ? (
          <p style={{ color: '#94A3B8', textAlign: 'center', padding: '2rem 0' }}>You haven't added any contacts yet.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {history.map((item) => (
              <div key={item.id} style={{ 
                border: '1px solid #E2E8F0', 
                borderRadius: 'var(--radius-md)', 
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'var(--off-white)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <h4 style={{ color: 'var(--primary-blue)', margin: '0 0 0.25rem 0', fontSize: '1.1rem' }}>{item.name}</h4>
                  
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button 
                      onClick={() => handleEdit(item)}
                      className="btn"
                      style={{ padding: '0.35rem', color: '#3B82F6', backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                      title="Edit Contact"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="btn"
                      style={{ padding: '0.35rem', color: 'var(--error-red)', backgroundColor: 'rgba(229, 62, 62, 0.1)' }}
                      title="Delete Contact"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Building2 size={16} color="#94A3B8" /> {item.department}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Phone size={16} color="#94A3B8" /> {item.phoneNumber}
                  </div>
                  {item.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Mail size={16} color="#94A3B8" /> {item.email}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default StaffContacts;
