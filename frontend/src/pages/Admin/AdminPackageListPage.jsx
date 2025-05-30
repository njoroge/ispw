 // Added useContext
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext'; // Import AuthContext

const AdminPackageListPage = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useContext(AuthContext); // Get token from AuthContext

  useEffect(() => {
    const fetchPackages = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get('http://localhost:5000/api/packages');
        setPackages(response.data);
      } catch (err) {
        setError(err.response ? (err.response.data.message || 'Failed to fetch packages.') : 'Network error or server is not responding.');
        console.error("Error fetching packages:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []); // Empty dependency array means this runs once on mount

  const handleDeletePackage = async (packageId, packageName) => {
    if (!window.confirm(`Are you sure you want to delete the package "${packageName}"?`)) {
      return;
    }

    if (!token) {
      alert('Authentication token not found. Please log in again.');
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/packages/${packageId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      alert(`Package "${packageName}" deleted successfully!`);
      setPackages(currentPackages => currentPackages.filter(p => p._id !== packageId));
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete package.';
      alert(`Error: ${errorMessage}`);
      console.error("Error deleting package:", err);
    }
  };

  // Basic styling for the table
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
   const linkAsButtonAddStyle = {
    display: 'inline-block',
    padding: '8px 15px',
    backgroundColor: '#007bff',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer'
  };


  if (loading) {
    return <p>Loading packages...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>Error: {error}</p>;
  }

  return (
    <div>
      <h2>Manage ISP Packages</h2>
      <Link to="/admin/packages/new" style={linkAsButtonAddStyle}>Add New Package</Link>
      
      {!loading && !error && packages.length === 0 && (
        <p>No packages found. Add some!</p>
      )}

      {!loading && !error && packages.length > 0 && (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Speed</th>
              <th style={thStyle}>Price ($/month)</th>
              <th style={thStyle}>Data Allowance</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {packages.map(pkg => (
              <tr key={pkg._id}>
                <td style={tdStyle}>{pkg.name}</td>
                <td style={tdStyle}>{pkg.speed}</td>
                <td style={tdStyle}>{pkg.price}</td>
                <td style={tdStyle}>{pkg.dataAllowance}</td>
                <td style={tdStyle}>
                  <Link to={`/admin/packages/edit/${pkg._id}`} style={actionButtonStyle}>Edit</Link>
                  <button onClick={() => handleDeletePackage(pkg._id, pkg.name)} style={actionButtonStyle}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminPackageListPage;
