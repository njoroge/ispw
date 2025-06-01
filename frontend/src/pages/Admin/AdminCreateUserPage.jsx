import { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext'; // Adjust path as needed

const AdminCreateUserPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    // password field is removed
    role: 'user', // Default role
  });
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.email) {
      setError('Username and email are required.');
      return;
    }
    // Basic email validation
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
         setError('Please enter a valid email address.');
         return;
    }
    // Password validation removed

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/admin/users/create',
        formData,
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );

      setSuccessMessage(response.data.message || 'User created successfully! Redirecting to user list...');
      setFormData({ username: '', email: '', role: 'user' }); // Reset form

      // Redirect to user list page after a short delay
      setTimeout(() => {
        navigate('/admin/users');
      }, 2000); // 2 seconds delay

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user. Please check the details and try again.');
      console.error("Create user error:", err.response?.data || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2>Create New User</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="username" style={{ marginRight: '5px' }}>Username:</label>
          <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} required />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="email" style={{ marginRight: '5px' }}>Email:</label>
          <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>
        {/* Password field div removed */}
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="role" style={{ marginRight: '5px' }}>Role:</label>
          <select id="role" name="role" value={formData.role} onChange={handleChange}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating User...' : 'Create User'}
        </button>
      </form>
    </div>
  );
};

export default AdminCreateUserPage;
