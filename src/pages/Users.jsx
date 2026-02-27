import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import AddUserModal from '../components/AddUserModal';
import AssignTeamModal from '../components/AssignTeamModal';

const Users = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const [isAssignTeamModalOpen, setIsAssignTeamModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await apiService.getUsers();
      // Handle paginated response from ambient-backend
      const usersArray = data?.result?.items || data?.items || data || [];
      setUsers(Array.isArray(usersArray) ? usersArray : []);
    } catch (error) {
      console.error('Error loading users:', error);
      // Mock data for demo
      setUsers([
        { id: 1, name: 'John Doe', email: 'john@example.com', department: 'Engineering', status: 'active', lastLogin: '2 hours ago' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', department: 'Marketing', status: 'active', lastLogin: '5 hours ago' },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', department: 'Sales', status: 'suspended', lastLogin: '2 days ago' },
        { id: 4, name: 'Alice Williams', email: 'alice@example.com', department: 'Engineering', status: 'active', lastLogin: '1 hour ago' },
        { id: 5, name: 'Charlie Brown', email: 'charlie@example.com', department: 'HR', status: 'active', lastLogin: '3 hours ago' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    // Safety check for undefined fields
    const name = user.name || '';
    const email = user.email || '';
    const status = user.status || 'active';
    
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || status === filterStatus;
    return matchesSearch && matchesFilter;
  });
  
  const handleUserClick = (userId) => {
    navigate(`/users/${userId}`);
  };
  const handleImageError = (userId) => {
    setImageErrors(prev => ({ ...prev, [userId]: true }));
  };
  const handleAssignTeam = (user, e) => {
    e.stopPropagation(); // Prevent row click
    setSelectedUser(user);
    setIsAssignTeamModalOpen(true);
  };



  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full bg-background-light dark:bg-background-dark min-h-screen">
      <div className="mb-6">
        <h2 className="text-[28px] font-bold text-text-primary dark:text-dark-primary mb-1">Users</h2>
        <p className="text-text-secondary dark:text-dark-secondary text-sm">Manage user accounts and permissions.</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted dark:text-dark-muted">
            search
          </span>
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-search-bg-light dark:bg-search-bg-dark border border-border-light dark:border-border-dark rounded-lg py-2.5 pl-10 pr-4 text-sm text-text-primary dark:text-dark-primary placeholder:text-text-secondary dark:placeholder:text-dark-secondary focus:ring-2 focus:ring-primary/20 focus:outline-none focus:border-primary transition-all"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg px-4 py-2.5 text-sm text-text-primary dark:text-dark-primary focus:ring-2 focus:ring-primary/20 focus:outline-none focus:border-primary transition-all"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
          
          <button onClick={() => setIsModalOpen(true)} className="bg-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-primary-hover transition-colors flex items-center gap-2 shadow-sm">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add User
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-surface-light dark:bg-surface-dark rounded-card border border-border-light dark:border-border-dark overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-[#3c4043] border-b border-border-subtle dark:border-border-dark">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-medium text-text-secondary dark:text-dark-secondary uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-medium text-text-secondary dark:text-dark-secondary uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-medium text-text-secondary dark:text-dark-secondary uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-medium text-text-secondary dark:text-dark-secondary uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3.5 text-right text-xs font-medium text-text-secondary dark:text-dark-secondary uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle dark:divide-border-dark">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-text-secondary dark:text-dark-secondary">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-text-secondary dark:text-dark-secondary">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} onClick={(e) => { if (!e.target.closest('button')) handleUserClick(user.id); }} className="hover:bg-gray-50 dark:hover:bg-[#3c4043] transition-colors cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.thumbnail_photo_url && !imageErrors[user.id] ? (
                          <img 
                            src={user.thumbnail_photo_url} 
                            alt={user.name || 'User'}
                            className="w-10 h-10 rounded-full object-cover border border-primary/20"
                            onError={() => handleImageError(user.id)}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
                            {(user.name || 'Unknown').split(' ').map(n => n[0]).join('')}
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-text-primary dark:text-dark-primary">{user.name || 'Unknown User'}</div>
                          <div className="text-sm text-text-secondary dark:text-dark-secondary">{user.primary_email || 'No email'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-text-primary dark:text-dark-primary">{user.department || 'Unassigned'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          (user.status || 'active') === 'active'
                            ? 'bg-success/10 text-success'
                            : 'bg-error/10 text-error'
                        }`}
                      >
                        {user.status || 'active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary dark:text-dark-secondary">
                      {user.lastLogin}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={(e) => handleAssignTeam(user, e)} className="text-primary hover:text-primary-hover font-medium transition-colors">Assign Team</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadUsers}
      />

      {/* Assign Team Modal */}
      <AssignTeamModal
        isOpen={isAssignTeamModalOpen}
        onClose={() => setIsAssignTeamModalOpen(false)}
        onSuccess={loadUsers}
        user={selectedUser}
      />
    </div>
  );
};

export default Users;
