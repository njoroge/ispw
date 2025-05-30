
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext'; // Adjust path if needed
import PackageForm from '../../components/Admin/PackageForm'; // Adjust path if needed

const AdminPackageFormPage = () => {
  const { id: packageId } = useParams(); // Get package ID from URL for edit mode
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [initialFormData, setInitialFormData] = useState(null);
  const [isLoadingPage, setIsLoadingPage] = useState(false); // For loading initial data in edit mode
  const [isSubmitting, setIsSubmitting] = useState(false); // For form submission
  const [error, setError] = useState(null);

  const isEditMode = Boolean(packageId);

  useEffect(() => {
    if (isEditMode && packageId) {
      setIsLoadingPage(true);
      setError(null);
      axios.get(`http://localhost:5000/api/packages/${packageId}`)
        .then(response => {
          setInitialFormData(response.data);
        })
        .catch(err => {
          setError(err.response ? (err.response.data.message || 'Failed to fetch package details.') : 'Network error.');
          console.error("Error fetching package details:", err);
        })
        .finally(() => {
          setIsLoadingPage(false);
        });
    }
  }, [packageId, isEditMode]);

  const handlePackageSubmit = async (formData) => {
    setIsSubmitting(true);
    setError(null);

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    try {
      if (isEditMode) {
        await axios.put(`http://localhost:5000/api/packages/${packageId}`, formData, { headers });
        alert('Package updated successfully!');
      } else {
        await axios.post('http://localhost:5000/api/packages', formData, { headers });
        alert('Package created successfully!');
      }
      navigate('/admin/packages'); // Redirect to package list on success
    } catch (err) {
      setError(err.response ? (err.response.data.message || 'Operation failed.') : 'Network error or server is not responding.');
      console.error("Form submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingPage) {
    return <p>Loading package details...</p>;
  }

  // If in edit mode and initialFormData is null (could be due to error or initial state before fetch)
  // and an error message exists, display the error.
  if (isEditMode && !initialFormData && error) {
    return <p style={{ color: 'red' }}>Error loading package: {error}</p>;
  }
  
  // If in edit mode and still loading (or data is not there yet for some other reason)
  // and no error has been set yet - this can be a brief state before error is set by failed fetch.
  if (isEditMode && !initialFormData && !error) {
      return <p>Loading package details...</p>; // Or some other placeholder
  }


  return (
    <div>
      <h2>{isEditMode ? 'Edit Package' : 'Create New Package'}</h2>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      
      {/* Render form only if not loading page OR if initialFormData is available for edit mode */}
      {/* For create mode, initialFormData will be null, so it should render immediately if not loading. */}
      {(!isEditMode || (isEditMode && initialFormData)) && (
        <PackageForm
          initialData={initialFormData}
          onFormSubmit={handlePackageSubmit}
          isEditMode={isEditMode}
          isLoading={isSubmitting}
        />
      )}
    </div>
  );
};

export default AdminPackageFormPage;
