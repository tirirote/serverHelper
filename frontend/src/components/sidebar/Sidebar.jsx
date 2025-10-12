import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';
import Icon from '/assets/icon.png';
import Logo from '/assets/logo.png';
// Íconos de Lucide React
import {
  Server,
  User,
  LogOut,
  ShoppingBag,
  Cpu,
  FolderOpen,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', icon: <LayoutDashboard />, to: '/dashboard' },
  { name: 'Workspaces', icon: <FolderOpen />, to: '/workspaces' },
  { name: 'Shop', icon: <ShoppingBag />, to: '/shop' },
  { name: 'Components', icon: <Cpu />, to: '/components' },
  { name: 'Servers', icon: <Server />, to: '/servers' }
];

const Sidebar = ({ isOpen, handleLogout, onToggle }) => {

  // Función para cerrar el sidebar al navegar (mejora la UX en móvil)
  const handleNavigation = () => {
    // En móvil, si está abierto, lo cerramos al pulsar un enlace.
    if (window.innerWidth <= 768 && isOpen) {
      onToggle();
    }
  };

  const ToggleIcon = isOpen ? ChevronLeft : ChevronRight;

  return (
    <nav className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
      <div className={styles.topSection}>
        <div className={styles.header}>
          {isOpen && <img
            src={Logo}
            alt="Icono de Server Helper"
            className={styles.logoImage}
          />}
          {!isOpen && <img
            src={Icon}
            alt="Icono de Server Helper"
            className={styles.iconImage}
          />}
          {/* Botón de Toggle DENTRO del Sidebar */}
          <button
            className={styles.toggleButton}
            onClick={onToggle}
            aria-label={isOpen ? "Contraer menú" : "Expandir menú"}
          >
            <ToggleIcon size={20} />
          </button>
        </div>

        <ul className={styles.navList}>
          {navItems.map((item) => (
            <li key={item.name} className={styles.navItemContainer}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.active : ''}`
                }
                onClick={handleNavigation} // Cierra al navegar
              >
                {item.icon}
                {isOpen && <span className={styles.navLabel}>{item.name}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.bottomSection}>
        <hr className={styles.divider} />
        <div className={styles.logoutSection}>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={20} />
            {isOpen && <span className={styles.navLabel}>Log Out</span>}
          </button>
        </div>
      </div>
    </nav>
  );
};

Sidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  handleLogout: PropTypes.func.isRequired,
  onToggle: PropTypes.func.isRequired,
};

export default Sidebar;