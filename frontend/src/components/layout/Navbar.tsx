import React from 'react';
import { FiBell, FiSun, FiMoon, FiMenu, FiSearch } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleTheme } from '@/store/slices/themeSlice';
import styles from './Navbar.module.css';

interface NavbarProps {
  onMenuToggle: () => void;
  pageTitle?: string;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuToggle, pageTitle }) => {
  const dispatch = useAppDispatch();
  const { isDark } = useAppSelector(s => s.theme);
  const { user } = useAppSelector(s => s.auth);

  return (
    <header className={styles.navbar}>
      <div className={styles.left}>
        <button className={styles.menuBtn} onClick={onMenuToggle} title="Toggle menu">
          <FiMenu />
        </button>
        {pageTitle && <h1 className={styles.pageTitle}>{pageTitle}</h1>}
      </div>

      <div className={styles.right}>
        <button className={styles.iconBtn} title="Toggle theme" onClick={() => dispatch(toggleTheme())}>
          {isDark ? <FiSun /> : <FiMoon />}
        </button>
        <button className={styles.iconBtn} title="Notifications">
          <FiBell />
          <span className={styles.notifDot} />
        </button>
        <div className={styles.userChip}>
          <div className={styles.avatar}>
            {user ? `${user.firstName[0]}${user.lastName[0]}` : 'U'}
          </div>
          <div className={styles.userMeta}>
            <span className={styles.userName}>{user?.firstName} {user?.lastName}</span>
            <span className={styles.userRole}>{user?.role}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
