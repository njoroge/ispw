import { useEffect, useState, useContext } from 'react';// Added useContext
import axios from 'axios';
import { AuthContext } from '../context/AuthContext'; // Adjust path as necessary

const UserProfilePage = () => {
  const [currentUserData, setCurrentUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null); // General page load error

  // State for Profile Update Form
  const [profileFormData, setProfileFormData] = useState({ username: '', email: '' });
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [profileSuccessMessage, setProfileSuccessMessage] = useState('');

  // State for Password Change Form
  const [passwordFormData, setPasswordFormData] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState('');

  const { token, user: authContextUser, logout, refreshUserData } = useContext(AuthContext); // Use refreshUserData

  useEffect(() => {
    const fetchUserProfile = async () => {
      // Prefer fresh data from API, but could use authContextUser as initial display if available
      // if (authContextUser) {
      //   setCurrentUserData(authContextUser);
      //   setIsLoading(false);
      //   // Optionally, still fetch in background to ensure it's up-to-date
      // }

      if (!token) {
        setError('You are not logged in.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null); // Reset error before new fetch
      try {
        const response = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        setCurrentUserData(response.data);
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to fetch user details.';
        setError(errorMessage);
        if (err.response?.status === 401) {
          // Optional: Consider logging out user if token is invalid
          // logout(); 
        }
        console.error("Error fetching user profile:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [token, logout]); // Re-fetch if token changes, logout included if used in error handling

  // Effect to initialize/sync profileFormData with currentUserData
  useEffect(() => {
    if (currentUserData) {
      setProfileFormData({
        username: currentUserData.username || '',
        email: currentUserData.email || '',
      });
    }
  }, [currentUserData]);

  const handleProfileInputChange = (e) => {
    setProfileFormData({ ...profileFormData, [e.target.name]: e.target.value });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!token) {
      setProfileError('Authentication token not found. Please log in again.');
      return;
    }
    setIsSubmittingProfile(true);
    setProfileError(null);
    setProfileSuccessMessage('');

    try {
      const response = await axios.put('http://localhost:5000/api/users/me/profile', profileFormData, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      setProfileSuccessMessage('Profile updated successfully!');
      setCurrentUserData(response.data); // Update local display immediately for responsiveness
      setProfileSuccessMessage('Profile updated successfully!');

      // Refresh global user state from AuthContext
      if (refreshUserData) {
        await refreshUserData();
      }
      // The direct call to setAuthContextUser(response.data) is now handled by refreshUserData internally
      // if (setAuthContextUser) {
      //    setAuthContextUser(response.data); 
      // }

    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile.');
      console.error("Profile update error:", err);
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  const handlePasswordInputChange = (e) => {
    setPasswordFormData({ ...passwordFormData, [e.target.name]: e.target.value });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!token) {
      setPasswordError('Authentication token not found. Please log in again.');
      return;
    }

    if (passwordFormData.newPassword !== passwordFormData.confirmNewPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (passwordFormData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    setIsSubmittingPassword(true);
    setPasswordError(null);
    setPasswordSuccessMessage('');

    try {
      await axios.put(
        'http://localhost:5000/api/users/me/password',
        {
          currentPassword: passwordFormData.currentPassword,
          newPassword: passwordFormData.newPassword,
        },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setPasswordSuccessMessage('Password updated successfully!');
      setPasswordFormData({ currentPassword: '', newPassword: '', confirmNewPassword: '' }); // Clear form
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to update password.');
      console.error("Password update error:", err);
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  if (isLoading) {
    return <p>Loading profile...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>Error: {error}</p>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Manage Your Profile</h2>

      {/* General page error or initial load error */}
      {error && !currentUserData && <p style={{ color: 'red' }}>Error: {error}</p>}

      {currentUserData ? (
        <>
          <h3>Username: {currentUserData.username}</h3>
          <h3>Email: {currentUserData.email}</h3>
          
          <hr style={{ margin: '20px 0' }} />
          
          <div>
            <h4>Update Profile Details</h4>
            {profileSuccessMessage && <p style={{ color: 'green' }}>{profileSuccessMessage}</p>}
            {profileError && <p style={{ color: 'red' }}>{profileError}</p>}
            <form onSubmit={handleProfileUpdate}>
              <div style={{ marginBottom: '10px' }}>
                <label htmlFor="username" style={{ marginRight: '5px' }}>Username:</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={profileFormData.username}
                  onChange={handleProfileInputChange}
                  required
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label htmlFor="email" style={{ marginRight: '5px' }}>Email:</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profileFormData.email}
                  onChange={handleProfileInputChange}
                  required
                />
              </div>
              <button type="submit" disabled={isSubmittingProfile}>
                {isSubmittingProfile ? 'Updating Profile...' : 'Update Profile'}
              </button>
            </form>
          </div>

          <hr style={{ margin: '20px 0' }} />

          <div>
            <h4>Change Password</h4>
            {passwordSuccessMessage && <p style={{ color: 'green' }}>{passwordSuccessMessage}</p>}
            {passwordError && <p style={{ color: 'red' }}>{passwordError}</p>}
            <form onSubmit={handleChangePassword}>
              <div style={{ marginBottom: '10px' }}>
                <label htmlFor="currentPassword" style={{ marginRight: '5px' }}>Current Password:</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordFormData.currentPassword}
                  onChange={handlePasswordInputChange}
                  required
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label htmlFor="newPassword" style={{ marginRight: '5px' }}>New Password:</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordFormData.newPassword}
                  onChange={handlePasswordInputChange}
                  required
                  minLength="6"
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label htmlFor="confirmNewPassword" style={{ marginRight: '5px' }}>Confirm New Password:</label>
                <input
                  type="password"
                  id="confirmNewPassword"
                  name="confirmNewPassword"
                  value={passwordFormData.confirmNewPassword}
                  onChange={handlePasswordInputChange}
                  required
                  minLength="6"
                />
              </div>
              <button type="submit" disabled={isSubmittingPassword}>
                {isSubmittingPassword ? 'Updating Password...' : 'Change Password'}
              </button>
            </form>
          </div>
        </>
      ) : (
        // This case might be hit if loading finishes but no user data (e.g., after a failed fetch not setting error)
        <p>Could not load user profile data.</p>
      )}
    </div>
  );
};

export default UserProfilePage;
