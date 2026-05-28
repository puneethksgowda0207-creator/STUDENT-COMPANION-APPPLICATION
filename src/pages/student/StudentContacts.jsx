import React, { useState, useEffect } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { Search, Phone, Mail, Building2, Contact } from 'lucide-react';

const DEPARTMENTS = [
  "All Departments",
  "Computer Science",
  "Information Technology",
  "Electronics",
  "Mechanical",
  "Civil",
  "Administration",
  "Other"
];

const StudentContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Filtering state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState(DEPARTMENTS[0]);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    setError('');
    
    try {
      const q = query(collection(db, 'staff_contacts'));
      const snapshot = await getDocs(q);
      const fetched = [];
      snapshot.forEach((doc) => {
        fetched.push({ id: doc.id, ...doc.data() });
      });
      
      // Sort alphabetically by name
      fetched.sort((a, b) => a.name.localeCompare(b.name));
      
      setContacts(fetched);
    } catch (err) {
      console.error("Error fetching contacts:", err);
      setError(`Failed to load contacts: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Filter contacts based on search term and department
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === "All Departments" || contact.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Search & Filter Header */}
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
        <h2 style={{ color: 'var(--primary-blue)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Contact size={24} /> Staff Directory
        </h2>
        
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 300px', position: 'relative' }}>
            <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search by staff name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.5rem', marginBottom: 0 }}
            />
          </div>
          
          <div style={{ flex: '1 1 200px' }}>
            <select 
              className="form-control" 
              value={selectedDept} 
              onChange={(e) => setSelectedDept(e.target.value)}
              style={{ marginBottom: 0 }}
            >
              {DEPARTMENTS.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Contacts Grid */}
      <div>
        {loading && <p style={{ color: 'var(--text-muted)' }}>Loading staff directory...</p>}
        {error && <p className="error-message" style={{ color: 'var(--error-red)' }}>{error}</p>}
        
        {!loading && !error && filteredContacts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94A3B8', background: 'white', borderRadius: 'var(--radius-lg)' }}>
            <Contact size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>No staff contacts found matching your search.</p>
          </div>
        )}

        <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          {filteredContacts.map(contact => (
            <div key={contact.id} style={{ 
              background: 'white', 
              borderRadius: 'var(--radius-lg)', 
              boxShadow: 'var(--shadow-sm)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ padding: '1.5rem', borderBottom: '1px solid #E2E8F0' }}>
                <h3 style={{ color: 'var(--text-main)', fontSize: '1.25rem', margin: '0 0 0.5rem 0' }}>{contact.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-blue)', fontSize: '0.9rem', fontWeight: '500' }}>
                  <Building2 size={16} /> {contact.department}
                </div>
              </div>
              
              <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
                  <div style={{ backgroundColor: '#F1F5F9', padding: '0.5rem', borderRadius: '50%' }}>
                    <Phone size={16} color="#64748B" />
                  </div>
                  <span style={{ fontSize: '0.95rem' }}>{contact.phoneNumber}</span>
                </div>
                
                {contact.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
                    <div style={{ backgroundColor: '#F1F5F9', padding: '0.5rem', borderRadius: '50%' }}>
                      <Mail size={16} color="#64748B" />
                    </div>
                    <span style={{ fontSize: '0.95rem' }}>{contact.email}</span>
                  </div>
                )}
              </div>
              
              <div style={{ display: 'flex', borderTop: '1px solid #E2E8F0' }}>
                <a 
                  href={`tel:${contact.phoneNumber}`} 
                  style={{ 
                    flex: 1, 
                    padding: '1rem', 
                    textAlign: 'center', 
                    textDecoration: 'none',
                    color: 'var(--primary-blue)',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    borderRight: contact.email ? '1px solid #E2E8F0' : 'none',
                    transition: 'background 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Phone size={18} /> Call
                </a>
                
                {contact.email && (
                  <a 
                    href={`mailto:${contact.email}`} 
                    style={{ 
                      flex: 1, 
                      padding: '1rem', 
                      textAlign: 'center', 
                      textDecoration: 'none',
                      color: '#10B981',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <Mail size={18} /> Email
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentContacts;
