import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, query, getDocs, deleteDoc, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../firebase';
import { Trash2, Users, Mail, Phone, CheckCircle } from 'lucide-react';

const StudentPeerFinder = ({ userData }) => {
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requiredMembers, setRequiredMembers] = useState('');
  const [skills, setSkills] = useState('');
  const [semester, setSemester] = useState(userData?.semester || '1');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Data State
  const [myRequests, setMyRequests] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  
  // Track which cards have contact info revealed (after successfully joining)
  const [revealedContacts, setRevealedContacts] = useState({});

  const fetchData = async () => {
    setDataLoading(true);
    try {
      const q = query(collection(db, 'peer_requests'));
      const snapshot = await getDocs(q);
      const fetchedAll = [];
      const fetchedMine = [];
      
      snapshot.forEach((d) => {
        const data = { id: d.id, ...d.data() };
        // Ensure defaults for backwards compatibility with old records
        if (!data.interestedMembers) data.interestedMembers = [];
        if (data.isFull === undefined) data.isFull = false;
        
        fetchedAll.push(data);
        if (data.createdByEmail === userData?.email) {
          fetchedMine.push(data);
        }
      });
      
      const sortFn = (a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0);
      fetchedAll.sort(sortFn);
      fetchedMine.sort(sortFn);
      
      setAllRequests(fetchedAll);
      setMyRequests(fetchedMine);
    } catch (err) {
      console.error("Error fetching peer requests:", err);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userData?.email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await addDoc(collection(db, 'peer_requests'), {
        title,
        description,
        requiredMembers: parseInt(requiredMembers),
        skills,
        semester: parseInt(semester),
        contactEmail,
        contactPhone,
        createdByEmail: userData.email,
        interestedMembers: [],
        isFull: false,
        createdAt: serverTimestamp()
      });

      setMessage('Team request posted successfully!');
      setTitle('');
      setDescription('');
      setRequiredMembers('');
      setSkills('');
      setContactEmail('');
      setContactPhone('');
      
      fetchData();
    } catch (error) {
      console.error("Error posting request:", error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this team request? This action cannot be undone.")) {
      try {
        await deleteDoc(doc(db, 'peer_requests', id));
        setMessage('Request deleted successfully!');
        fetchData();
      } catch (err) {
        console.error("Error deleting request:", err);
        setMessage(`Error: ${err.message}`);
      }
    }
  };

  const handleInterest = async (item) => {
    // 1. Creator restriction
    if (item.createdByEmail === userData?.email) {
      alert("You are the creator of this request.");
      return;
    }

    // 2. Duplicate prevention
    if (item.interestedMembers && item.interestedMembers.includes(userData?.email)) {
      alert("You already joined this request.");
      // Just reveal contacts if they already joined
      setRevealedContacts(prev => ({ ...prev, [item.id]: true }));
      return;
    }

    // 3. Prevent joining if already full
    if (item.isFull || (item.interestedMembers && item.interestedMembers.length >= item.requiredMembers)) {
      alert("This team is already full!");
      return;
    }

    try {
      const newInterestedMembers = [...(item.interestedMembers || []), userData.email];
      const isNowFull = newInterestedMembers.length >= item.requiredMembers;

      const docRef = doc(db, 'peer_requests', item.id);
      await updateDoc(docRef, {
        interestedMembers: arrayUnion(userData.email),
        isFull: isNowFull
      });

      // Update local state to reflect UI changes instantly
      setRevealedContacts(prev => ({ ...prev, [item.id]: true }));
      fetchData();
      
      alert("Successfully joined! Contact details are now revealed.");

    } catch (error) {
      console.error("Error joining request:", error);
      alert("An error occurred while joining the team. Please try again.");
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Just now';
    return timestamp.toDate().toLocaleDateString();
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Create Request Form */}
      <div style={{ background: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
        <h2 style={{ color: 'var(--primary-blue)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={24} /> Create Team Request
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
          <div className="form-group">
            <label>Project Title</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g. Final Year Web App Project" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Short Description</label>
            <textarea 
              className="form-control" 
              placeholder="Describe the project and what you're looking for..." 
              rows="3"
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label>Required Members</label>
              <input 
                type="number" 
                min="1"
                className="form-control" 
                placeholder="e.g. 2" 
                value={requiredMembers}
                onChange={e => setRequiredMembers(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label>Semester</label>
              <select className="form-control" value={semester} onChange={e => setSemester(e.target.value)}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Required Skills (Comma separated)</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g. React, Node.js, Design" 
              value={skills}
              onChange={e => setSkills(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label>Contact Email</label>
              <input 
                type="email" 
                className="form-control" 
                placeholder="email@college.edu" 
                value={contactEmail}
                onChange={e => setContactEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label>Contact Phone</label>
              <input 
                type="tel" 
                className="form-control" 
                placeholder="+1 234 567 8900" 
                value={contactPhone}
                onChange={e => setContactPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Posting...' : 'Post Request'}
          </button>
        </form>
      </div>

      {/* My Requests (Ownership Control) */}
      <div style={{ background: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
        <h3 style={{ color: 'var(--text-main)', marginBottom: '1.5rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.5rem' }}>My Requests</h3>
        
        {dataLoading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading my requests...</p>
        ) : myRequests.length === 0 ? (
          <p style={{ color: '#94A3B8', textAlign: 'center', padding: '1rem 0' }}>You haven't posted any requests yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {myRequests.map((item) => (
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <h4 style={{ color: 'var(--primary-blue)', margin: 0, fontSize: '1.05rem' }}>{item.title}</h4>
                    {item.isFull ? (
                      <span style={{ fontSize: '0.75rem', backgroundColor: '#FEE2E2', color: '#EF4444', padding: '0.15rem 0.5rem', borderRadius: '1rem', fontWeight: 'bold' }}>Full</span>
                    ) : (
                      <span style={{ fontSize: '0.75rem', backgroundColor: '#DCFCE7', color: '#22C55E', padding: '0.15rem 0.5rem', borderRadius: '1rem', fontWeight: 'bold' }}>Open</span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0 0 0.5rem 0' }}>{item.description}</p>
                  
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '500', marginBottom: '0.25rem' }}>
                    {item.interestedMembers?.length || 0} / {item.requiredMembers} Members Joined
                  </div>
                  
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Posted on {formatDate(item.createdAt)}
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
                  title="Delete Request"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Peer Requests */}
      <div style={{ background: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
        <h3 style={{ color: 'var(--text-main)', marginBottom: '1.5rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.5rem' }}>All Peer Requests</h3>
        
        {dataLoading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading network...</p>
        ) : allRequests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94A3B8' }}>
            <Users size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>No peer requests found across the network.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
            {allRequests.map((item) => {
              const joinedCount = item.interestedMembers?.length || 0;
              const slotsRemaining = item.requiredMembers - joinedCount;
              const hasJoined = item.interestedMembers && item.interestedMembers.includes(userData?.email);
              
              return (
                <div key={item.id} style={{ 
                  border: '1px solid #E2E8F0', 
                  borderLeft: item.isFull ? '4px solid #EF4444' : '4px solid var(--accent-blue)',
                  borderRadius: 'var(--radius-md)', 
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: 'var(--off-white)',
                  opacity: item.isFull ? 0.8 : 1
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h4 style={{ color: 'var(--primary-blue)', margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{item.title}</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                      <span style={{ fontSize: '0.8rem', backgroundColor: '#E2E8F0', padding: '0.2rem 0.6rem', borderRadius: '1rem', color: '#475569' }}>
                        Sem {item.semester}
                      </span>
                      {item.isFull ? (
                        <span style={{ fontSize: '0.75rem', backgroundColor: '#FEE2E2', color: '#EF4444', padding: '0.15rem 0.5rem', borderRadius: '1rem', fontWeight: 'bold' }}>Full</span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', backgroundColor: '#DCFCE7', color: '#22C55E', padding: '0.15rem 0.5rem', borderRadius: '1rem', fontWeight: 'bold' }}>Open</span>
                      )}
                    </div>
                  </div>
                  
                  <p style={{ color: 'var(--text-main)', fontSize: '0.9rem', marginBottom: '1rem', flex: 1 }}>{item.description}</p>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                    {item.skills.split(',').map((skill, index) => (
                      <span key={index} style={{ fontSize: '0.75rem', backgroundColor: 'var(--primary-blue)', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                  
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: '500', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{joinedCount} / {item.requiredMembers} Members Joined</span>
                    {!item.isFull && <span style={{ color: '#22C55E' }}>{slotsRemaining} Slot{slotsRemaining > 1 ? 's' : ''} Remaining</span>}
                  </div>

                  <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '1rem', marginTop: 'auto' }}>
                    {(hasJoined || revealedContacts[item.id]) ? (
                      <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0', animation: 'fadeIn 0.3s' }}>
                        <p style={{ margin: '0 0 0.5rem 0', color: '#10B981', fontWeight: '500', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <CheckCircle size={16} /> Contact the student using:
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                          <Mail size={16} color="#64748B" /> {item.contactEmail}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                          <Phone size={16} color="#64748B" /> {item.contactPhone}
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleInterest(item)}
                        className="btn btn-primary"
                        style={{ 
                          width: '100%', 
                          backgroundColor: item.isFull ? '#94A3B8' : 'var(--primary-blue)',
                          cursor: item.isFull ? 'not-allowed' : 'pointer',
                          borderColor: item.isFull ? '#94A3B8' : 'var(--primary-blue)'
                        }}
                        disabled={item.isFull}
                      >
                        {item.isFull ? 'Team Full' : "I'm Interested"}
                      </button>
                    )}
                  </div>
                  
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default StudentPeerFinder;
