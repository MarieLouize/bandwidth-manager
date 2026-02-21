import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Context & Layout
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';

// Core
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';

// Identity Management
import UsersList from './pages/Users/UsersList';
import UserForm from './pages/Users/UserForm/UserForm';
import Groups from './pages/Groups/Groups';

// Traffic Shaping & Policies
import PoliciesList from './pages/Policies/PoliciesList';
import CreatePolicy from './pages/Policies/CreatePolicy/CreatePolicy';
import EditPolicy from './pages/Policies/EditPolicy/EditPolicy';
import PolicyDetail from './pages/Policies/PolicyDetail/PolicyDetail';

// Network Simulation
import Simulation from './pages/Simulation/Simulation';

// Monitoring
import RealTime from './pages/Monitoring/RealTime/RealTime';
import Historical from './pages/Monitoring/Historical/Historical';

// Analytics & Auditing
import Alerts from './pages/Alerts/Alerts';
import Reports from './pages/Reports/Reports';
import ReportView from './pages/Reports/ReportView/ReportView';

// System Configuration
import Settings from './pages/Settings/Settings';
import AdminAccounts from './pages/Settings/AdminAccounts/AdminAccounts';

import NotFound from './pages/NotFound/NotFound';

// Protection Wrapper
const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
};

const App: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
        />
        
         <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
        
        {/* Core Dashboard */}
        <Route path="/dashboard" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />

        {/* Identity Management */}
        <Route path="/users" element={<ProtectedLayout><UsersList /></ProtectedLayout>} />
        <Route path="/users/new" element={<ProtectedLayout><UserForm /></ProtectedLayout>} />
        <Route path="/users/edit/:id" element={<ProtectedLayout><UserForm /></ProtectedLayout>} />
        <Route path="/groups" element={<ProtectedLayout><Groups /></ProtectedLayout>} />

        {/* Traffic Shaping & Policies */}
        <Route path="/policies" element={<ProtectedLayout><PoliciesList /></ProtectedLayout>} />
        <Route path="/policies/new" element={<ProtectedLayout><CreatePolicy /></ProtectedLayout>} />
        <Route path="/policies/:id" element={<ProtectedLayout><PolicyDetail /></ProtectedLayout>} />
        <Route path="/policies/edit/:id" element={<ProtectedLayout><EditPolicy /></ProtectedLayout>} />

        {/* Network Simulation Sandbox */}
        <Route path="/simulation" element={<ProtectedLayout><Simulation /></ProtectedLayout>} />

        {/* Monitoring */}
        <Route path="/monitoring" element={<Navigate to="/monitoring/realtime" replace />} />
        <Route path="/monitoring/realtime" element={<ProtectedLayout><RealTime /></ProtectedLayout>} />
        <Route path="/monitoring/historical" element={<ProtectedLayout><Historical /></ProtectedLayout>} />

        {/* Analytics & Auditing */}
        <Route path="/alerts" element={<ProtectedLayout><Alerts /></ProtectedLayout>} />
        <Route path="/reports" element={<ProtectedLayout><Reports /></ProtectedLayout>} />
        <Route path="/reports/view/:id" element={<ProtectedLayout><ReportView /></ProtectedLayout>} />

        {/* Settings & Admin Management */}
        <Route path="/settings" element={<ProtectedLayout><Settings /></ProtectedLayout>} />
        <Route path="/settings/admins" element={<ProtectedLayout><AdminAccounts /></ProtectedLayout>} />
        
        {/* Fallback route - catches typos and sends logged-in users to Dashboard */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
