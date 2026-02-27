import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import AddTeamModal from '../components/AddTeamModal';

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const data = await apiService.getTeams();
      // Handle paginated response from ambient-backend
      const teamsArray = data?.result?.items || data?.items || data || [];
      setTeams(Array.isArray(teamsArray) ? teamsArray : []);
    } catch (error) {
      console.error('Error loading teams:', error);
      // Mock data for demo
      setTeams([
        { id: 1, name: 'Frontend Team', department: 'Engineering', members: 12, lead: 'John Doe', status: 'active' },
        { id: 2, name: 'Backend Team', department: 'Engineering', members: 15, lead: 'Jane Smith', status: 'active' },
        { id: 3, name: 'DevOps Team', department: 'Engineering', members: 8, lead: 'Bob Johnson', status: 'active' },
        { id: 4, name: 'Digital Marketing', department: 'Marketing', members: 10, lead: 'Alice Williams', status: 'active' },
        { id: 5, name: 'Content Team', department: 'Marketing', members: 6, lead: 'Charlie Brown', status: 'active' },
        { id: 6, name: 'Sales APAC', department: 'Sales', members: 18, lead: 'David Lee', status: 'active' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full bg-background-light dark:bg-background-dark min-h-screen">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-[28px] font-bold text-text-primary dark:text-dark-primary mb-1">Teams</h2>
          <p className="text-text-secondary dark:text-dark-secondary text-sm">Manage team organization and members.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-primary-hover transition-colors flex items-center gap-2 shadow-sm">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Create Team
        </button>
      </div>

      <div className="bg-surface-light dark:bg-surface-dark rounded-card border border-border-light dark:border-border-dark overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-[#3c4043] border-b border-border-subtle dark:border-border-dark">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-medium text-text-secondary dark:text-dark-secondary uppercase tracking-wider">
                  Team
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-medium text-text-secondary dark:text-dark-secondary uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-medium text-text-secondary dark:text-dark-secondary uppercase tracking-wider">
                  Team Lead
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-medium text-text-secondary dark:text-dark-secondary uppercase tracking-wider">
                  Members
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-medium text-text-secondary dark:text-dark-secondary uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3.5 text-right text-xs font-medium text-text-secondary dark:text-dark-secondary uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle dark:divide-border-dark">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-text-secondary dark:text-dark-secondary">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </td>
                </tr>
              ) : (
                teams.map((team, index) => (
                  <tr key={`${team.id}-${index}`} className="hover:bg-gray-50 dark:hover:bg-[#3c4043] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-xl text-indigo-600 flex items-center justify-center mr-3">
                          <span className="material-symbols-outlined text-[20px]">groups</span>
                        </div>
                        <div className="text-sm font-medium text-text-primary dark:text-dark-primary">{team.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-text-primary dark:text-dark-primary">{team.department?.name || team.department || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-text-primary dark:text-dark-primary">{team.lead || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="material-symbols-outlined text-text-muted dark:text-dark-muted mr-1 text-[16px]">person</span>
                        <span className="text-sm text-text-primary dark:text-dark-primary">{team.members}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-success/10 text-success">
                        {team.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-primary hover:text-primary-hover mr-4 font-medium transition-colors">View</button>
                      <button className="text-text-secondary dark:text-dark-secondary hover:text-text-primary dark:hover:text-dark-primary font-medium transition-colors">Edit</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Team Modal */}
      <AddTeamModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={loadTeams}
      />
    </div>
  );
};

export default Teams;
