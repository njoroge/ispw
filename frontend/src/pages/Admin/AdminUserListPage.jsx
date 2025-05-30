
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext'; // Adjust path if necessary

const AdminUserListPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token, user: loggedInUser } = useContext(AuthContext); // Get token and logged-in user object

  useEffect(() => {
    const fetchUsers = async () => {
      if (!token) {
        setError('Authentication token not found. Please log in.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get('http://localhost:5000/api/admin/users', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        setUsers(response.data);
      } catch (err) {
        setError(err.response ? (err.response.data.message || 'Failed to fetch users.') : 'Network error or server is not responding.');
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [token]); // Re-run if token changes (e.g., on login/logout, though AdminRoute should handle access)

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
      return;
    }

    if (!token) {
      alert('Authentication token not found. Please log in again.');
      return;
    }

    if (loggedInUser && loggedInUser._id === userId) {
      alert("Error: You cannot delete your own account from this panel.");
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      alert(`User "${username}" deleted successfully!`);
      setUsers(currentUsers => currentUsers.filter(u => u._id !== userId));
    } catch (err) {
      alert(`Failed to delete user: ${err.response?.data?.message || err.message}`);
      console.error("Delete user error:", err);
    }
  };

  // Basic styling for the table (can be moved to a CSS file)
  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
  };
  const thStyle = {
    border: '1px solid #ddd',
    padding: '8px',
    textAlign: 'left',
    backgroundColor: '#f2f2f2',
  };
  const tdStyle = {
    border: '1px solid #ddd',
    padding: '8px',
    textAlign: 'left',
  };
  const actionButtonStyle = {
    marginRight: '5px',
    padding: '5px 10px',
    textDecoration: 'none',
    border: '1px solid #ccc',
    borderRadius: '4px',
    cursor: 'pointer'
  };

  if (loading) {
    return <p>Loading users...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>Error: {error}</p>;
  }

  return (
    <div>
      <h2>User Management</h2>
      
      {!loading && !error && users.length === 0 && (
        <p>No users found.</p>
      )}

      {!loading && !error && users.length > 0 && (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Username</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Role</th>
              <th style={thStyle}>Joined Date</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td style={tdStyle}>{user.username}</td>
                <td style={tdStyle}>{user.email}</td>
                <td style={tdStyle}>{user.role}</td>
                <td style={tdStyle}>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td style={tdStyle}>
                  <Link to={`/admin/users/edit/${user._id}`} style={actionButtonStyle}>Edit</Link>
                  <button onClick={() => handleDeleteUser(user._id, user.username)} style={actionButtonStyle}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminUserListPage;
