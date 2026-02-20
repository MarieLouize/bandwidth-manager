import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, X, LayoutDashboard, Activity, Users, 
  Layers, FileText, Shield, Settings, LogOut, 
  Bell, TestTube 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from './Layout.module.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeSidebar = () => setIsSidebarOpen(false);

  // Complete Navigation Array
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/monitoring', label: 'Monitoring', icon: <Activity size={20} /> },
    { path: '/users', label: 'Users & Devices', icon: <Users size={20} /> },
    { path: '/groups', label: 'Groups & Depts', icon: <Layers size={20} /> },
    { path: '/policies', label: 'Policies', icon: <Shield size={20} /> },
    { path: '/simulation', label: 'Simulation', icon: <TestTube size={20} /> },
    { path: '/alerts', label: 'Alerts', icon: <Bell size={20} /> },
    { path: '/reports', label: 'Reports', icon: <FileText size={20} /> },
    { path: '/settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className={styles.layoutWrapper}>
      
      {/* Mobile Top Bar */}
      <div className={styles.mobileTopBar}>
        <div className={styles.brandName}>Bandwidth Manager</div>
        <button className={styles.menuBtn} onClick={() => setIsSidebarOpen(true)}>
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Overlay */}
      <div 
        className={`${styles.overlay} ${isSidebarOpen ? styles.show : ''}`} 
        onClick={closeSidebar}
      />

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.open : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.brand}>
            <span className={styles.brandName}>BMS Admin</span>
            <span className={styles.brandSub}>University of Ibadan</span>
          </div>
          <button className={styles.closeBtn} onClick={closeSidebar}>
            <X size={24} />
          </button>
        </div>

        <nav className={styles.navLinks}>
          {navItems.map((item) => {
            // Active state tracking (matches sub-routes like /policies/new as well)
            const isActive = location.pathname.startsWith(item.path);
            return (
              <NavLink 
                key={item.path} 
                to={item.path} 
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                onClick={closeSidebar}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <button className={styles.logoutBtn} onClick={handleLogout}>
          <LogOut size={20} />
          <span>Log Out</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <main className={styles.mainContent}>
        {children}
      </main>
      
    </div>
  );
};

export default Layout;
