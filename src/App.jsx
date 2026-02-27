import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Departments from './pages/Departments';
import Teams from './pages/Teams';
import Insights from './pages/Insights';
import Logs from './pages/Logs';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDetail from './pages/UserDetail';
import TeamDetail from './pages/TeamDetail';
import DepartmentDetail from './pages/DepartmentDetail';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="users" element={<Users />} />
              <Route path="departments" element={<Departments />} />
              <Route path="teams" element={<Teams />} />
              <Route path="insights" element={<Insights />} />
              <Route path="logs" element={<Logs />} />
              <Route path="settings" element={<Settings />} />
              <Route path="users/:userId" element={<UserDetail />} />
              <Route path="teams/:teamId" element={<TeamDetail />} />
              <Route path="departments/:departmentId" element={<DepartmentDetail />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
