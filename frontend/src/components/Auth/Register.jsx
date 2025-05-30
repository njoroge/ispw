import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // For redirection

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Hook for navigation

  const { username, email, password } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!username || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      // Assuming backend is running on port 5000
      // Adjust if your backend port is different or if you set up a proxy
      const res = await axios.post('/api/auth/register', formData, {
        baseURL: 'http://localhost:5000', // Explicitly set baseURL
      });
      setMessage(res.data.message || 'User registered successfully! Please login.');
      // Optionally redirect to login page after a delay or directly
      setTimeout(() => {
        navigate('/login');
      }, 2000); 
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else if (err.request) {
        setError('Network error: Could not connect to the server.');
      } else {
        setError('Registration failed. Please try again.');
      }
      console.error('Registration error:', err);
    }
  };

  return (
    <div>
      <h2>Register</h2>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={onSubmit}>
        <div>
          <label>Username</label>
          <input
            type="text"
            name="username"
            value={username}
            onChange={onChange}
            // required // Basic HTML5 validation
          />
        </div>
        <div>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={onChange}
            // required
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={password}
            onChange={onChange}
            // minLength="6" // Basic HTML5 validation
          />
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Register;
