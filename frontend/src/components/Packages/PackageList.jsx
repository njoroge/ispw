 import { useEffect, useState, useContext } from 'react';// Added useContext
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext'; // Import AuthContext

function PackageList() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, token } = useContext(AuthContext); // Get auth state and token
  const [subscribing, setSubscribing] = useState({ id: null, status: false }); // For individual button loading

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        // Assuming backend is on localhost:5000
        const response = await axios.get('http://localhost:5000/api/packages');
        setPackages(response.data);
        setError(null);
      } catch (err) {
        setError(err.response ? (err.response.data.message || 'Error fetching packages') : 'Error fetching packages');
        console.error("Error fetching packages:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []); // Empty dependency array means this effect runs once on mount

  if (loading) {
    return <p>Loading packages...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  if (packages.length === 0) {
    return <p>No packages available at the moment.</p>;
  }

  const handleSubscribe = async (packageId, packageName) => {
    if (!isAuthenticated || !token) {
      alert("Please log in to subscribe.");
      return;
    }
    setSubscribing({ id: packageId, status: true });
    try {
      const response = await axios.post(
        'http://localhost:5000/api/subscriptions/subscribe',
        { packageId: packageId },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      alert(`Successfully subscribed to ${packageName}!`);
      // Optionally, you might want to refresh user data or package status here
      // For example, if the subscribed package should now look different.
      console.log('Subscription successful:', response.data);
    } catch (err) {
      alert(`Subscription failed: ${err.response ? err.response.data.message : err.message}`);
      console.error("Subscription error:", err);
    } finally {
      setSubscribing({ id: packageId, status: false });
    }
  };

  return (
    <div>
      <h2>Our Internet Packages</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {packages.map((pkg) => (
          <div key={pkg._id || pkg.name} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '5px', width: '300px' }}>
            <h3>{pkg.name}</h3>
            <p><strong>Speed:</strong> {pkg.speed}</p>
            <p><strong>Price:</strong> ${pkg.price}/month</p>
            <p><strong>Data:</strong> {pkg.dataAllowance}</p>
            {pkg.description && <p><em>{pkg.description}</em></p>}
            {isAuthenticated && (
              <button 
                onClick={() => handleSubscribe(pkg._id, pkg.name)}
                disabled={subscribing.id === pkg._id && subscribing.status}
              >
                {subscribing.id === pkg._id && subscribing.status ? 'Subscribing...' : 'Subscribe'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default PackageList;
