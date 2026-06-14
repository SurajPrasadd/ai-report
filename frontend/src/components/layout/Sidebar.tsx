import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  FiGrid, FiFolder, FiUsers, FiZap, FiList,
  FiCpu, FiFileText, FiLogOut, FiChevronLeft,
  FiChevronRight, FiBarChart2,
} from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logoutThunk } from '@/store/slices/authSlice';
import { getInitials } from '@/utils/helpers';
import styles from './Sidebar.module.css';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  roles?: string[];
}

const navItems: NavItem[] = [
  { to: '/dashboard', icon: <FiGrid />, label: 'Dashboard' },
  { to: '/projects', icon: <FiFolder />, label: 'Projects' },
  { to: '/employees', icon: <FiUsers />, label: 'Employees' },
  { to: '/sprints', icon: <FiZap />, label: 'Sprints' },
  { to: '/jira', icon: <FiList />, label: 'Jira Stories' },
  { to: '/ai-usage', icon: <FiCpu />, label: 'AI Usage' },
  { to: '/excel', icon: <FiFileText />, label: 'Excel Export' },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(s => s.auth);

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      {/* Logo */}
      <div className={styles.logo}>
        <div className={styles.logoIcon}>🤖</div>
        {!collapsed && (
          <div className={styles.logoText}>
            <span className={styles.logoTitle}>AI Tracker</span>
            <span className={styles.logoSub}>Productivity System</span>
          </div>
        )}
        <button className={styles.toggleBtn} onClick={onToggle} title="Toggle sidebar">
          {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
        </button>
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.navGroup}>
          {!collapsed && <span className={styles.navGroupLabel}>Main Menu</span>}
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
              title={collapsed ? item.label : ''}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* User section */}
      <div className={styles.userSection}>
        {user && (
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>
              {getInitials(user.firstName, user.lastName)}
            </div>
            {!collapsed && (
              <div className={styles.userDetails}>
                <span className={styles.userName}>{user.firstName} {user.lastName}</span>
                <span className={styles.userRole}>{user.role} • {user.employeeId}</span>
              </div>
            )}
          </div>
        )}
        <button
          className={styles.logoutBtn}
          onClick={() => dispatch(logoutThunk())}
          title="Logout"
        >
          <FiLogOut />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
