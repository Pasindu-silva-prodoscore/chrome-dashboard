import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout = () => {
  return (
    <div className="flex min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-dark-primary">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 bg-surface-light dark:bg-surface-dark">
        <Header />
        <div className="flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
