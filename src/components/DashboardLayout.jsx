import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  Home, Bell, FileText, Book, BookOpen, 
  Users, User, LogOut, GraduationCap 
} from 'lucide-react';

const DashboardLayout = ({ user, userData, role, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const studentLinks = [
    { to: "/student-dashboard", icon: <Home size={20} />, label: "Home", exact: true },
    { to: "/student-dashboard/notices", icon: <Bell size={20} />, label: "Notices" },
    { to: "/student-dashboard/exam-notices", icon: <FileText size={20} />, label: "Exam Notices" },
    { to: "/student-dashboard/notes", icon: <Book size={20} />, label: "Notes" },
    { to: "/student-dashboard/assignments", icon: <BookOpen size={20} />, label: "Assignments" },
    { to: "/student-dashboard/peer-finder", icon: <Users size={20} />, label: "Peer Finder" },
    { to: "/student-dashboard/contacts", icon: <User size={20} />, label: "Staff Contacts" },
  ];

  const staffLinks = [
    { to: "/staff-dashboard", icon: <Home size={20} />, label: "Home", exact: true },
    { to: "/staff-dashboard/upload-notices", icon: <Bell size={20} />, label: "Upload Notices" },
    { to: "/staff-dashboard/upload-exams", icon: <FileText size={20} />, label: "Upload Exam Notices" },
    { to: "/staff-dashboard/upload-notes", icon: <Book size={20} />, label: "Upload Notes" },
    { to: "/staff-dashboard/upload-assignments", icon: <BookOpen size={20} />, label: "Upload Assignments" },
    { to: "/staff-dashboard/contacts", icon: <User size={20} />, label: "Staff Contacts" },
  ];

  const links = role === 'staff' ? staffLinks : studentLinks;

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <GraduationCap size={28} />
          <span>SCA Portal</span>
        </div>
        
        <div className="sidebar-nav">
          {links.map((link) => (
            <NavLink 
              key={link.to} 
              to={link.to}
              end={link.exact}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              {link.icon}
              {link.label}
            </NavLink>
          ))}
        </div>
        
        <div className="sidebar-footer">
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', marginBottom: '1rem' }}>
            Logged in as:<br/>
            <strong style={{ color: 'white' }}>{user?.email}</strong>
          </div>
          <button onClick={handleLogout} className="btn" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>
            <LogOut size={18} style={{ marginRight: '8px' }}/> Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        <div className="topbar">
          <h2 style={{ fontSize: '1.2rem', color: 'var(--text-main)', margin: 0, textTransform: 'capitalize' }}>
            {userData?.role} Dashboard {userData?.role === 'student' && `- Semester ${userData?.semester}`}
          </h2>
        </div>
        <div className="content-area">
          {/* This renders the nested routes */}
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
