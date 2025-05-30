
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext'; // Adjust path if necessary
import UserEditForm from '../../components/Admin/UserEditForm'; // Adjust path if necessary

const AdminEditUserPage = () => {
  const { id: userIdToEdit } = useParams(); // Get user ID from URL
  const navigate = useNavigate();
  const { token, user: loggedInUser } = useContext(AuthContext); // Get token and current logged-in user from context

  const [userToEdit, setUserToEdit] = useState(null);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); // For main profile form
  const [error, setError] = useState(null); // For main profile form and page load

  // State for Usage Data Form
  const [usageFormData, setUsageFormData] = useState({ simulatedDataUsed: '', billingCycleStartDate: '' });
  const [isSubmittingUsage, setIsSubmittingUsage] = useState(false);
  const [usageError, setUsageError] = useState(null);
  const [usageSuccessMessage, setUsageSuccessMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setError("Authentication token not found. Please log in.");
      setIsLoadingPage(false);
      return;
    }
    if (userIdToEdit) {
      setIsLoadingPage(true);
      setError(null);
      axios.get(`http://localhost:5000/api/admin/users/${userIdToEdit}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      .then(response => {
        setUserToEdit(response.data);
      })
      .catch(err => {
        setError(err.response ? (err.response.data.message || 'Failed to fetch user details.') : 'Network error.');
        console.error("Error fetching user details:", err);
      })
      .finally(() => {
        setIsLoadingPage(false);
      });
    } else {
      // Should not happen if routes are set up correctly, but good to handle
      setError("No user ID provided for editing.");
      setIsLoadingPage(false);
    }
  }, [userIdToEdit, token]);

  // Effect to initialize/sync usageFormData with userToEdit data
  useEffect(() => {
    if (userToEdit) {
      setUsageFormData({
        simulatedDataUsed: userToEdit.simulatedDataUsed !== undefined ? userToEdit.simulatedDataUsed : 0,
        billingCycleStartDate: userToEdit.billingCycleStartDate 
          ? new Date(userToEdit.billingCycleStartDate).toISOString().split('T')[0] 
          : ''
      });
    }
  }, [userToEdit]);

  const handleUsageInputChange = (e) => {
    setUsageFormData({ ...usageFormData, [e.target.name]: e.target.value });
  };

  const handleUsageUpdate = async (e) => {
    e.preventDefault();
    if (!token) {
      setUsageError("Authentication token not found. Please log in again.");
      return;
    }
    setIsSubmittingUsage(true);
    setUsageError(null);
    setUsageSuccessMessage('');

    const payload = {
      simulatedDataUsed: parseFloat(usageFormData.simulatedDataUsed),
      // Only send billingCycleStartDate if it's not empty, otherwise backend might try to parse an empty string
      ...(usageFormData.billingCycleStartDate && { billingCycleStartDate: usageFormData.billingCycleStartDate })
    };
    
    // Validate simulatedDataUsed again after parseFloat
    if (isNaN(payload.simulatedDataUsed) || payload.simulatedDataUsed < 0) {
        setUsageError("Simulated data used must be a non-negative number.");
        setIsSubmittingUsage(false);
        return;
    }

    try {
      const response = await axios.put(`http://localhost:5000/api/admin/users/${userIdToEdit}/usage`, payload, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      setUsageSuccessMessage('Usage data updated successfully!');
      setUserToEdit(response.data.user); // Update the main user state on the page
      // The useEffect for usageFormData will re-sync it based on updated userToEdit
    } catch (err) {
      setUsageError(err.response?.data?.message || 'Failed to update usage data.');
      console.error("Usage update error:", err);
    } finally {
      setIsSubmittingUsage(false);
    }
  };

  const handleUserUpdate = async (formData) => {
    if (!token) {
      setError("Authentication token not found. Please log in again.");
      return;
    }
    setIsSubmitting(true);
    setError(null);

    // Filter out any fields that were not intended to be updated or are empty if needed
    // For this implementation, the backend handles which fields it updates from the User model.
    // We are sending username, email, role.
    const dataToSubmit = {
        username: formData.username,
        email: formData.email,
        role: formData.role
    };

    try {
      await axios.put(`http://localhost:5000/api/admin/users/${userIdToEdit}`, dataToSubmit, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      alert('User updated successfully!');
      navigate('/admin/users'); // Redirect to user list on success
    } catch (err) {
      setError(err.response ? (err.response.data.message || 'User update failed.') : 'Network error or server is not responding.');
      console.error("User update error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingPage) {
    return <p>Loading user details...</p>;
  }

  if (error && !userToEdit) { // If there was an error loading initial data
    return <p style={{ color: 'red' }}>Error: {error}</p>;
  }
  
  if (!userToEdit) { // If still no user data after loading (e.g. invalid ID from URL directly)
      return <p>User not found or could not be loaded.</p>
  }

  return (
    <div>
      <h2>Edit User: {userToEdit.username}</h2>
      {error && <p style={{ color: 'red' }}>Error during profile update: {error}</p>}
      <UserEditForm
        initialData={userToEdit}
        onFormSubmit={handleUserUpdate}
        isSubmitting={isSubmitting}
        isCurrentUser={loggedInUser?._id === userToEdit?._id}
      />

      <hr style={{ margin: '30px 0' }} />

      <h3>Manage Usage Data</h3>
      {usageSuccessMessage && <p style={{ color: 'green' }}>{usageSuccessMessage}</p>}
      {usageError && <p style={{ color: 'red' }}>{usageError}</p>}
      <form onSubmit={handleUsageUpdate}>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="simulatedDataUsed" style={{ marginRight: '5px' }}>Simulated Data Used (GB):</label>
          <input
            type="number"
            id="simulatedDataUsed"
            name="simulatedDataUsed"
            value={usageFormData.simulatedDataUsed}
            onChange={handleUsageInputChange}
            step="0.1"
            min="0"
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="billingCycleStartDate" style={{ marginRight: '5px' }}>Billing Cycle Start Date:</label>
          <input
            type="date"
            id="billingCycleStartDate"
            name="billingCycleStartDate"
            value={usageFormData.billingCycleStartDate}
            onChange={handleUsageInputChange}
          />
        </div>
        <button type="submit" disabled={isSubmittingUsage}>
          {isSubmittingUsage ? 'Updating Usage...' : 'Update Usage Data'}
        </button>
      </form>
    </div>
  );
};

export default AdminEditUserPage;
