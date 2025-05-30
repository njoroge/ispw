

const PackageForm = ({ initialData, onFormSubmit, isEditMode, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    speed: '',
    price: '',
    dataAllowance: '',
    description: '',
  });

  useEffect(() => {
    if (isEditMode && initialData) {
      setFormData({
        name: initialData.name || '',
        speed: initialData.speed || '',
        price: initialData.price || '',
        dataAllowance: initialData.dataAllowance || '',
        description: initialData.description || '',
      });
    } else if (!isEditMode) {
      // Reset form for add mode or if initialData is not available
      setFormData({
        name: '',
        speed: '',
        price: '',
        dataAllowance: '',
        description: '',
      });
    }
  }, [initialData, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFormSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name">Package Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label htmlFor="speed">Speed:</label>
        <input
          type="text"
          id="speed"
          name="speed"
          value={formData.speed}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label htmlFor="price">Price ($/month):</label>
        <input
          type="number"
          id="price"
          name="price"
          value={formData.price}
          onChange={handleChange}
          step="0.01"
          required
        />
      </div>
      <div>
        <label htmlFor="dataAllowance">Data Allowance:</label>
        <input
          type="text"
          id="dataAllowance"
          name="dataAllowance"
          value={formData.dataAllowance}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label htmlFor="description">Description (Optional):</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
        />
      </div>
      <button type="submit" disabled={isLoading}>
        {isLoading 
          ? (isEditMode ? 'Updating...' : 'Creating...') 
          : (isEditMode ? 'Update Package' : 'Create Package')}
      </button>
    </form>
  );
};

export default PackageForm;
