
import { AuthContext } from '../context/AuthContext'; // Adjust path as needed

function Dashboard() {
  const { token } = useContext(AuthContext); // Example: Display token or user info

  return (
    <div>
      <h2>Dashboard</h2>
      <p>Welcome to your dashboard!</p>
      {token && (
        <p style={{ wordBreak: 'break-all' }}>
          Your Token (for testing): {token}
        </p>
      )}
    </div>
  );
}

export default Dashboard;
