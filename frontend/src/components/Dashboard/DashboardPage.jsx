import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext'; // Adjust path if necessary

function DashboardPage() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token, logout } = useContext(AuthContext); // Assuming logout is available in AuthContext

  useEffect(() => {
    if (token) {
      setLoading(true);
      setError(null); // Reset error on new attempt
      axios.get('http://localhost:5000/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(response => {
        setUserData(response.data);
      })
      .catch(err => {
        const errorMessage = err.response ? (err.response.data.message || 'Failed to fetch user data.') : 'Network error or server is not responding.';
        setError(errorMessage);
        console.error("Error fetching user data:", err);
        if (err.response && err.response.status === 401) {
          // Optional: handle token expiry by logging out the user
          // This might be aggressive if it's a temporary network issue,
          // but good for security if token is truly invalid.
          // logout(); 
          // Consider redirecting to login page here if logout() doesn't handle it.
        }
      })
      .finally(() => {
        setLoading(false);
      });
    } else {
      // No token, user likely not authenticated or token cleared.
      // App.jsx routing should ideally handle redirect to login.
      setLoading(false);
      // setError("You are not logged in."); // Or let App.jsx handle redirect
    }
  }, [token, logout]); // Added logout to dependency array if used inside useEffect

  if (loading) {
    return <p>Loading dashboard...</p>;
  }

  if (error) {
    // If user is not logged in and App.jsx hasn't redirected, this error might show.
    // Or if there was an actual fetch error.
    return <p style={{ color: 'red' }}>Error: {error}</p>;
  }

  if (!userData) {
    // This case might be hit if there's no token and no error set,
    // or if data fetching completed without error but userData is still null.
    return <p>Could not load user data. You might not be logged in. <Link to="/login">Login</Link></p>;
  }

  return (
    <div>
      <h2>Dashboard</h2>
      <p>Welcome, {userData.username}!</p>
      <p>Email: {userData.email}</p>

      <hr style={{ margin: '20px 0' }} />

      <h3>My Internet Usage</h3>
      {!userData.currentPackage ? (
        <div>
          <p>You are not currently subscribed to any plan.</p>
          <p>Check out our <Link to="/packages">Available Packages</Link>!</p>
        </div>
      ) : (
        <div>
          <p><strong>Your Current Package:</strong> {userData.currentPackage.name}</p>
          <p><strong>Monthly Data Allowance:</strong> {userData.currentPackage.dataAllowance}</p>
          <p><strong>Data Used This Cycle:</strong> {userData.simulatedDataUsed !== undefined ? userData.simulatedDataUsed.toFixed(1) : 'N/A'} GB</p>
          <p><strong>Billing Cycle Started:</strong> {userData.billingCycleStartDate ? new Date(userData.billingCycleStartDate).toLocaleDateString() : 'N/A'}</p>

          {(() => {
            const allowanceNumeric = userData.currentPackage.dataAllowanceNumeric;
            const dataUsed = userData.simulatedDataUsed !== undefined ? userData.simulatedDataUsed : 0;

            if (allowanceNumeric && allowanceNumeric > 0) {
              const percentageUsed = Math.max(0, Math.min((dataUsed / allowanceNumeric) * 100, 100));
              return (
                <div style={{ marginTop: '10px' }}>
                  <p>{percentageUsed.toFixed(1)}% of your allowance used.</p>
                  <div style={{ border: '1px solid #ccc', width: '100%', backgroundColor: '#e9ecef', borderRadius: '.25rem' }}>
                    <div 
                      style={{ 
                        width: `${percentageUsed}%`, 
                        backgroundColor: percentageUsed > 90 ? '#dc3545' : (percentageUsed > 70 ? '#ffc107' : '#28a745'), 
                        height: '24px', 
                        lineHeight: '24px', 
                        textAlign: 'center', 
                        color: 'white',
                        borderRadius: '.25rem' 
                      }}
                    >
                      {percentageUsed.toFixed(1)}%
                    </div>
                  </div>
                </div>
              );
            } else if (allowanceNumeric === null || allowanceNumeric === -1) { // -1 or null for "Unlimited"
              return <p style={{ marginTop: '10px' }}>You are on an unlimited data plan.</p>;
            } else {
              return <p style={{ marginTop: '10px' }}>Data allowance information is currently unavailable.</p>;
            }
          })()}
        </div>
      )}
    </div>
  );
}

export default DashboardPage;
