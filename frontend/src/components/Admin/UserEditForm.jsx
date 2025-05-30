

const UserEditForm = ({ initialData, onFormSubmit, isSubmitting, isCurrentUser }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: 'user', // Default role
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        username: initialData.username || '',
        email: initialData.email || '',
        role: initialData.role || 'user',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFormSubmit(formData); // Submit only the fields present in formData
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="username">Username:</label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label htmlFor="role">Role:</label>
        <select
          id="role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          // Simplification: Not disabling admin role change for self here.
          // The backend has a check for demoting the last admin.
          // A more complex UI could be:
          // disabled={isCurrentUser && initialData?.role === 'admin' && formData.role === 'user'}
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <button type="submit" disabled={isSubmitting} style={{ marginTop: '10px' }}>
        {isSubmitting ? 'Updating...' : 'Update User'}
      </button>
    </form>
  );
};

export default UserEditForm;
