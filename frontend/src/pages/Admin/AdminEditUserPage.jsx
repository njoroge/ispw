
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
    </div>
  );
};

export default AdminEditUserPage;
