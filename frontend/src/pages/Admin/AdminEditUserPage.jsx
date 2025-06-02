
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

  // State for Package Management
  const [availablePackages, setAvailablePackages] = useState([]);
  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [isLoadingPackages, setIsLoadingPackages] = useState(true);
  const [packageManagementError, setPackageManagementError] = useState(null);
  const [packageManagementSuccess, setPackageManagementSuccess] = useState(null);
  const [isAssigningPackage, setIsAssigningPackage] = useState(false); // For disabling button during action

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

  // Fetch available packages
  useEffect(() => {
    const fetchPackages = async () => {
      if (!token) {
        setPackageManagementError("Authentication token not found. Please log in.");
        setIsLoadingPackages(false);
        return;
      }
      try {
        setIsLoadingPackages(true);
        setPackageManagementError(null);
        const response = await axios.get('http://localhost:5000/api/packages', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        setAvailablePackages(response.data);
      } catch (err) {
        setPackageManagementError(err.response?.data?.message || 'Failed to fetch packages.');
        console.error("Error fetching packages:", err);
      } finally {
        setIsLoadingPackages(false);
      }
    };

    fetchPackages();
  }, [token]);

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

  const handleAssignPackage = async () => {
    if (!selectedPackageId) {
      setPackageManagementError('Please select a package to assign.');
      return;
    }
    if (!token) {
      setPackageManagementError('Authentication token not found.');
      return;
    }

    setIsAssigningPackage(true);
    setPackageManagementError(null);
    setPackageManagementSuccess(null);

    try {
      const response = await axios.put(
        `http://localhost:5000/api/admin/users/${userIdToEdit}/assign-package`,
        { packageId: selectedPackageId },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setUserToEdit(response.data.user); // Update the main user state
      setPackageManagementSuccess(response.data.message || 'Package assigned successfully!');
      setSelectedPackageId(''); // Reset selection
    } catch (err) {
      setPackageManagementError(err.response?.data?.message || 'Failed to assign package.');
      console.error("Error assigning package:", err);
    } finally {
      setIsAssigningPackage(false);
    }
  };

  const handleRemovePackage = async () => {
    if (!userToEdit?.currentPackage) {
      setPackageManagementError('User does not have a package to remove.');
      return;
    }
    if (!token) {
      setPackageManagementError('Authentication token not found.');
      return;
    }

    // Optional: Add a confirmation dialog
    if (!window.confirm(`Are you sure you want to remove the package from ${userToEdit.username}?`)) {
       return;
    }

    setIsAssigningPackage(true); // Can reuse the same loading state or create a new one
    setPackageManagementError(null);
    setPackageManagementSuccess(null);

    try {
      const response = await axios.put(
        `http://localhost:5000/api/admin/users/${userIdToEdit}/assign-package`,
        { packageId: null }, // Send null to indicate removal
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setUserToEdit(response.data.user); // Update the main user state
      setPackageManagementSuccess(response.data.message || 'Package removed successfully!');
    } catch (err) {
      setPackageManagementError(err.response?.data?.message || 'Failed to remove package.');
      console.error("Error removing package:", err);
    } finally {
      setIsAssigningPackage(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
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

  const isAdminEditingSelf = loggedInUser?._id === userToEdit?._id;

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

      <h3>Manage User's Package Subscription</h3>
      {packageManagementError && <p style={{ color: 'red' }}>{packageManagementError}</p>}
      {packageManagementSuccess && <p style={{ color: 'green' }}>{packageManagementSuccess}</p>}

      {isAdminEditingSelf && (
        <p style={{ fontStyle: 'italic', color: '#555', marginTop: '10px', marginBottom: '10px' }}>
          Package assignment for your own account is not managed through this interface.
        </p>
      )}

      {isLoadingPackages ? (
        <p>Loading packages...</p>
      ) : (
        <div style={isAdminEditingSelf ? { opacity: 0.5, pointerEvents: 'none' } : {}}>
          <div>
            <p><strong>Current Package:</strong> {userToEdit.currentPackage ? userToEdit.currentPackage.name : 'None'}</p>
            <p><strong>Subscription Date:</strong> {formatDate(userToEdit.subscriptionDate)}</p>
          </div>
          <div style={{ margin: '20px 0' }}>
            <label htmlFor="packageSelect" style={{ marginRight: '10px' }}>Change Package:</label>
            <select
              id="packageSelect"
              value={selectedPackageId}
              onChange={(e) => setSelectedPackageId(e.target.value)}
              disabled={isAdminEditingSelf || isLoadingPackages || isAssigningPackage}
              style={{ marginRight: '10px', padding: '5px' }}
            >
              <option value="">-- Select a Package --</option>
              {availablePackages.map(pkg => (
                <option key={pkg._id} value={pkg._id}>{pkg.name} - ${pkg.price}/{pkg.billingCycle}</option>
              ))}
            </select>
            <button
              onClick={handleAssignPackage}
              disabled={isAdminEditingSelf || !selectedPackageId || isAssigningPackage || isLoadingPackages}
              style={{ padding: '5px 10px', marginRight: '5px' }}
            >
              {isAssigningPackage ? 'Assigning...' : 'Assign Package'}
            </button>
            <button
              onClick={handleRemovePackage}
              disabled={isAdminEditingSelf || !userToEdit.currentPackage || isAssigningPackage || isLoadingPackages}
              style={{ padding: '5px 10px', backgroundColor: 'red', color: 'white' }}
            >
              {isAssigningPackage ? 'Removing...' : 'Remove Package'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEditUserPage;
