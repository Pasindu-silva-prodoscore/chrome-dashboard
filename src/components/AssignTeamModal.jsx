import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

const AssignTeamModal = ({ isOpen, onClose, onSuccess, user }) => {
  const [formData, setFormData] = useState({
    team_id: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [teams, setTeams] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadTeams();
      // Pre-select current team if user has one
      if (user?.team_id) {
        setFormData({ team_id: user.team_id });
      }
    }
  }, [isOpen, user]);

  const loadTeams = async () => {
    try {
      setLoadingTeams(true);
      const data = await apiService.getTeams();
      // Handle paginated response from ambient-backend
      const teamsArray = data?.result?.items || data?.items || data || [];
      setTeams(Array.isArray(teamsArray) ? teamsArray : []);
    } catch (err) {
      console.error('Error loading teams:', err);
      setError('Failed to load teams. Please try again.');
      setTeams([]); // Ensure teams is always an array
    } finally {
      setLoadingTeams(false);
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

    if (!formData.team_id) {
      setError('Please select a team');
      return;
    }

    if (!user?.id) {
      setError('Invalid user');
      return;
    }

    setLoading(true);

    try {
      await apiService.assignUserToTeam(user.id, formData.team_id);
      setFormData({ team_id: '' });
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Error assigning team:', err);
      setError(err.response?.data?.message || 'Failed to assign team. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ team_id: '' });
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface-light dark:bg-surface-dark rounded-card border border-border-light dark:border-border-dark w-full max-w-md shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-subtle dark:border-border-dark">
          <div>
            <h2 className="text-xl font-semibold text-text-primary dark:text-dark-primary">Assign to Team</h2>
            {user && (
              <p className="text-sm text-text-secondary dark:text-dark-secondary mt-1">
                {user.name} ({user.primary_email})
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="text-text-secondary dark:text-dark-secondary hover:text-text-primary dark:hover:text-dark-primary transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="team_id" className="block text-sm font-medium text-text-primary dark:text-dark-primary mb-2">
              Team <span className="text-error">*</span>
            </label>
            {loadingTeams ? (
              <div className="bg-input-bg-light dark:bg-input-bg-dark border border-border-light dark:border-border-dark rounded-lg px-4 py-3 text-text-secondary dark:text-dark-secondary">
                Loading teams...
              </div>
            ) : (
              <select
                id="team_id"
                name="team_id"
                value={formData.team_id}
                onChange={handleChange}
                required
                className="w-full bg-input-bg-light dark:bg-input-bg-dark border border-border-light dark:border-border-dark rounded-lg px-4 py-3 text-text-primary dark:text-dark-primary focus:ring-2 focus:ring-primary/20 focus:outline-none focus:border-primary transition-all"
              >
                <option value="">Select a team</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 border border-border-light dark:border-border-dark rounded-lg text-text-primary dark:text-dark-primary font-medium hover:bg-gray-50 dark:hover:bg-[#3c4043] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || loadingTeams}
              className="flex-1 bg-primary text-white px-4 py-2.5 rounded-lg font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Assigning...
                </>
              ) : (
                'Assign Team'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignTeamModal;
