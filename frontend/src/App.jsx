import { useContext, useEffect, useCallback, useState } from 'react';
import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import Register from './components/Auth/Register'; // Assuming .js, Vite handles .jsx/.js
import Login from './components/Auth/Login';       // Assuming .js
import DashboardPage from './components/Dashboard/DashboardPage'; // Updated to DashboardPage
import PackageList from './components/Packages/PackageList'; // Import PackageList
import { AuthContext } from './context/AuthContext';
import './App.css'; // Default Vite App styling

// Import Admin components
import AdminRoute from './components/Routing/AdminRoute';
import AdminDashboardPage from './pages/Admin/AdminDashboardPage';
import AdminPackageListPage from './pages/Admin/AdminPackageListPage';
import AdminPackageFormPage from './pages/Admin/AdminPackageFormPage';
import AdminUserListPage from './pages/Admin/AdminUserListPage'; // Import AdminUserListPage
import AdminEditUserPage from './pages/Admin/AdminEditUserPage'; // Import AdminEditUserPage
import AdminCreateUserPage from './pages/Admin/AdminCreateUserPage'; // Adjust path if needed
import NotAuthorizedPage from './pages/NotAuthorizedPage';
import SpeedTestPage from './pages/SpeedTestPage'; // Import SpeedTestPage
import UserProfilePage from './pages/UserProfilePage'; // Import UserProfilePage

function App() {
  const { isAuthenticated, isAdmin, logout } = useContext(AuthContext); // Added isAdmin
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login'); // Redirect to login after logout
  };

  return (
    <>
      <nav style={{ padding: '1rem', background: '#f0f0f0', marginBottom: '1rem' }}>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', gap: '1rem' }}>
          <li><Link to="/">Home/Dashboard</Link></li>
          {!isAdmin && (
            <li><Link to="/packages">Packages</Link></li>
          )}
          {isAuthenticated ? (
            <>
              {isAdmin && (
                <>
                  <li><Link to="/admin/dashboard">Admin Dashboard</Link></li>
                  <li><Link to="/admin/packages">Manage Packages (Admin)</Link></li>
                  <li><Link to="/admin/users">Manage Users</Link></li> {/* Added Manage Users link */}
                </>
              )}
              <li><Link to="/profile">My Profile</Link></li> {/* Added My Profile link */}
              <li><Link to="/speedtest">Speed Test</Link></li> {/* Added Speed Test link for authenticated users */}
              <li><button onClick={handleLogout} style={{ background: 'none', border: 'none', padding: 0, color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}>Logout</button></li>
            </>
          ) : (
            <>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
            </>
          )}
        </ul>
      </nav>

      <div style={{ padding: '1rem' }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/packages" element={<PackageList />} />
          <Route path="/unauthorized" element={<NotAuthorizedPage />} />

          {/* User Routes (Protected by isAuthenticated in element prop) */}
          <Route path="/" element={isAuthenticated ? <DashboardPage /> : <Login />} />
          <Route path="/speedtest" element={isAuthenticated ? <SpeedTestPage /> : <Navigate to="/login" replace />} />
          <Route path="/profile" element={isAuthenticated ? <UserProfilePage /> : <Navigate to="/login" replace />} />

          {/* Admin Routes (Protected by AdminRoute component) */}
          <Route element={<AdminRoute />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/packages" element={<AdminPackageListPage />} />
            <Route path="/admin/packages/new" element={<AdminPackageFormPage />} />
            <Route path="/admin/packages/edit/:id" element={<AdminPackageFormPage />} />
            <Route path="/admin/users" element={<AdminUserListPage />} />
            <Route path="/admin/users/new" element={<AdminCreateUserPage />} />
            <Route path="/admin/users/edit/:id" element={<AdminEditUserPage />} />
          </Route>
          
          {/* Simple protected route for root was:
          <Route path="/" element={isAuthenticated ? <DashboardPage /> : <Login />} /> 
          More sophisticated protected routes can be built. */}
        </Routes>
      </div>

      {/* Default Vite content - can be removed or modified */}
      {/* <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src="/react.svg" className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p> */}
    </>
  );
}

export default App;
