import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import AddDepartmentModal from '../components/AddDepartmentModal';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const data = await apiService.getDepartments();
      setDepartments(data);
    } catch (error) {
      console.error('Error loading departments:', error);
      // Mock data for demo
      setDepartments([
        { id: 1, name: 'Engineering', userCount: 145, teamCount: 12, manager: 'Sarah Johnson' },
        { id: 2, name: 'Marketing', userCount: 58, teamCount: 5, manager: 'Mike Wilson' },
        { id: 3, name: 'Sales', userCount: 92, teamCount: 8, manager: 'Emily Davis' },
        { id: 4, name: 'HR', userCount: 24, teamCount: 3, manager: 'David Chen' },
        { id: 5, name: 'Finance', userCount: 36, teamCount: 4, manager: 'Lisa Anderson' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full bg-background-light dark:bg-background-dark min-h-screen">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-[28px] font-bold text-text-primary mb-1">Departments</h2>
          <p className="text-text-secondary text-sm">Manage organizational departments and structure.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-primary-hover transition-colors flex items-center gap-2 shadow-sm">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Department
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
          ))
        ) : (
          departments.map((dept) => (
            <div
              key={dept.id}
              className="bg-surface-light dark:bg-slate-900 p-6 rounded-card border border-border-light dark:border-slate-800 hover:border-primary/30 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">corporate_fare</span>
                </div>
                <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-text-secondary transition-colors">
                  <span className="material-symbols-outlined text-[20px]">more_vert</span>
                </button>
              </div>
              
              <h3 className="text-[18px] font-semibold text-text-primary mb-1">{dept.name}</h3>
              <p className="text-[13px] text-text-secondary mb-4">Manager: {dept.manager}</p>
              
              <div className="flex gap-4 pt-4 border-t border-border-subtle dark:border-slate-800">
                <div className="flex-1">
                  <div className="text-[24px] font-bold text-text-primary">{dept.userCount}</div>
                  <div className="text-xs text-text-secondary font-medium">Users</div>
                </div>
                <div className="flex-1">
                  <div className="text-[24px] font-bold text-text-primary">{dept.teamCount}</div>
                  <div className="text-xs text-text-secondary font-medium">Teams</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Department Modal */}
      <AddDepartmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={loadDepartments}
      />
    </div>
  );
};

export default Departments;
