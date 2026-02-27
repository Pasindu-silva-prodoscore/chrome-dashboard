import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

const AddTeamModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    department_id: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadDepartments();
    }
  }, [isOpen]);

  const loadDepartments = async () => {
    try {
      setLoadingDepartments(true);
      const data = await apiService.getDepartments();
      // Handle paginated response from ambient-backend
      const deptArray = data?.result?.items || data?.items || data || [];
      setDepartments(Array.isArray(deptArray) ? deptArray : []);
    } catch (err) {
      console.error('Error loading departments:', err);
      setError('Failed to load departments. Please try again.');
      setDepartments([]); // Ensure departments is always an array
    } finally {
      setLoadingDepartments(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.department_id) {
      setError('Team name and department are required');
      return;
    }
    setLoading(true);

    try {
      await apiService.createTeam(formData);
      setFormData({ name: '', department_id: '' });
      onSuccess?.();
      onClose();
    } catch (err) {
      // Handle error display - convert objects to strings
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        // If detail is an array of validation errors (Pydantic)
        if (Array.isArray(detail)) {
          setError(detail.map(e => `${e.loc?.join('.') || 'Field'}: ${e.msg}`).join(', '));
        } else if (typeof detail === 'object') {
          // If detail is an object, stringify it
          setError(JSON.stringify(detail));
        } else {
          setError(String(detail));
        }
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Failed to create team. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({ name: '', department_id: '' });
      setError('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Create Team</h3>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg flex items-start gap-2">
              <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-[18px] flex-shrink-0 mt-0.5">
                error
              </span>
              <p className="text-sm text-red-800 dark:text-red-300">
                {error}
              </p>
            </div>
          )}

          {/* Team Name Input */}
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Team Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Frontend Team, Backend Team..."
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>

          {/* Department Selection */}
          <div className="mb-4">
            <label htmlFor="department_id" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Department <span className="text-red-500">*</span>
            </label>
            <select
              id="department_id"
              name="department_id"
              value={formData.department_id}
              onChange={handleChange}
              required
              disabled={loadingDepartments}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all disabled:opacity-50"
            >
              <option value="">
                {loadingDepartments ? 'Loading departments...' : 'Select a department'}
              </option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>


          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary-hover hover:to-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">groups</span>
                  <span>Create</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTeamModal;
