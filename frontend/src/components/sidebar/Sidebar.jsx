import React from 'react';
import PropTypes from 'prop-types';
import styles from './Sidebar.module.css';
import { NavLink } from 'react-router-dom'; // Usaremos NavLink para el enrutamiento

// Los iconos se importan de Lucide React
import {
  Server,
  User,
  LogOut,
  ShoppingBag,
  Cpu,
  FolderOpen
} from 'lucide-react';

const navItems = [
  { name: 'Workspaces', icon: <FolderOpen />, to: '/workspaces' },
  { name: 'Shop', icon: <ShoppingBag />, to: '/shop' },
  { name: 'Components', icon: <Cpu />, to: '/components' },
  { name: 'Servers', icon: <Server />, to: '/servers' }
];

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <nav className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
      <div className={styles.topSection}>
        <div className={styles.header}>
          <span className={styles.logo}>LOGO</span>
        </div>

        <ul className={styles.navList}>
          {navItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.active : ''}`
                }
                onClick={onClose}
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.bottomSection}>
        <hr className={styles.divider} />
        <div className={styles.logoutSection}>
          <button className={styles.logoutBtn} onClick={() => { /* Lógica de logout */ }}>
            <LogOut />
            <span>Log Out</span>
          </button>
          <User size={24} />
        </div>
      </div>
    </nav>
  );
};

Sidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Sidebar;