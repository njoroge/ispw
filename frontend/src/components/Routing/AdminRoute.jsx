
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext'; // Adjust path as necessary

const AdminRoute = () => {
  const { isAuthenticated, isAdmin, loadingAuth } = useContext(AuthContext);

  if (loadingAuth) {
    // Display a loading indicator while authentication status is being determined
    return <div>Loading authentication status...</div>;
  }

  if (!isAuthenticated) {
    // If not authenticated, redirect to login page
    // Pass the current location to redirect back after login, if desired
    // return <Navigate to="/login" state={{ from: location }} replace />;
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    // If authenticated but not an admin, redirect to an unauthorized page or homepage
    return <Navigate to="/unauthorized" replace />;
    // Alternatively, redirect to user dashboard: return <Navigate to="/" replace />;
  }

  // If authenticated and is an admin, render the child routes
  return <Outlet />;
};

export default AdminRoute;
