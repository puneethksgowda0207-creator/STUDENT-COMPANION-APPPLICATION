import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Welcome from './pages/Welcome';
import Login from './pages/Login';
import RoleSelection from './pages/RoleSelection';
import DashboardLayout from './components/DashboardLayout';
import StudentHome from './pages/StudentHome';
import StaffHome from './pages/StaffHome';
import Placeholder from './components/Placeholder';
import StudentNotes from './pages/student/StudentNotes';
import StaffNotesUpload from './pages/staff/StaffNotesUpload';
import StudentNotices from './pages/student/StudentNotices';
import StudentExamNotices from './pages/student/StudentExamNotices';
import StaffNotices from './pages/staff/StaffNotices';
import StaffExamNotices from './pages/staff/StaffExamNotices';
import StaffAssignmentsUpload from './pages/staff/StaffAssignmentsUpload';
import StudentAssignments from './pages/student/StudentAssignments';
import StudentPeerFinder from './pages/student/StudentPeerFinder';
import StaffContacts from './pages/staff/StaffContacts';
import StudentContacts from './pages/student/StudentContacts';

const ProtectedRoute = ({ user, userData, requireRole, allowedRole, children }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If role is required but user hasn't selected a role yet
  if (requireRole && (!userData || !userData.role)) {
    return <Navigate to="/role-selection" replace />;
  }

  // If a specific role is required
  if (allowedRole && userData && userData.role !== allowedRole) {
    return <Navigate to={userData.role === 'staff' ? '/staff-dashboard' : '/student-dashboard'} replace />;
  }

  return children;
};

function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);

  // Load state from localStorage on init
  useEffect(() => {
    const storedUser = localStorage.getItem('demo_user');
    const storedUserData = localStorage.getItem('demo_userdata');
    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedUserData) setUserData(JSON.parse(storedUserData));
  }, []);

  const handleLogin = (email) => {
    const newUser = { email, uid: 'demo123' };
    setUser(newUser);
    localStorage.setItem('demo_user', JSON.stringify(newUser));
  };

  const handleSaveRole = (data) => {
    setUserData(data);
    localStorage.setItem('demo_userdata', JSON.stringify(data));
  };

  const handleLogout = () => {
    setUser(null);
    setUserData(null);
    localStorage.removeItem('demo_user');
    localStorage.removeItem('demo_userdata');
  };

  const getHomeRoute = () => {
    if (!userData || !userData.role) return '/role-selection';
    return userData.role === 'staff' ? '/staff-dashboard' : '/student-dashboard';
  };

  return (
    <BrowserRouter>
      <div className="app-container">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={
            user ? <Navigate to={getHomeRoute()} replace /> : <Welcome />
          } />
          
          <Route path="/login" element={
            user ? <Navigate to={getHomeRoute()} replace /> : <Login onLogin={handleLogin} />
          } />
          
          <Route path="/role-selection" element={
            user ? (
              userData && userData.role ? (
                <Navigate to={getHomeRoute()} replace />
              ) : (
                <RoleSelection user={user} setLocalUserData={handleSaveRole} />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          } />
          
          {/* Student Dashboard Routes */}
          <Route path="/student-dashboard" element={
            <ProtectedRoute user={user} userData={userData} requireRole={true} allowedRole="student">
              <DashboardLayout user={user} userData={userData} role="student" onLogout={handleLogout} />
            </ProtectedRoute>
          }>
            <Route index element={<StudentHome userData={userData} />} />
            <Route path="notices" element={<StudentNotices />} />
            <Route path="exam-notices" element={<StudentExamNotices />} />
            <Route path="notes" element={<StudentNotes userData={userData} />} />
            <Route path="assignments" element={<StudentAssignments userData={userData} />} />
            <Route path="peer-finder" element={<StudentPeerFinder userData={userData} />} />
            <Route path="contacts" element={<StudentContacts />} />
          </Route>

          {/* Staff Dashboard Routes */}
          <Route path="/staff-dashboard" element={
            <ProtectedRoute user={user} userData={userData} requireRole={true} allowedRole="staff">
              <DashboardLayout user={user} userData={userData} role="staff" onLogout={handleLogout} />
            </ProtectedRoute>
          }>
            <Route index element={<StaffHome userData={userData} />} />
            <Route path="upload-notices" element={<StaffNotices userData={userData} />} />
            <Route path="upload-exams" element={<StaffExamNotices userData={userData} />} />
            <Route path="upload-notes" element={<StaffNotesUpload userData={userData} />} />
            <Route path="upload-assignments" element={<StaffAssignmentsUpload userData={userData} />} />
            <Route path="contacts" element={<StaffContacts userData={userData} />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
