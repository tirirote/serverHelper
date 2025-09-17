import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../sidebar/Sidebar';
import styles from './Layout.module.css';
import { Menu } from 'lucide-react';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={styles.layoutContainer}>
      {/* Botón para abrir/cerrar la sidebar */}
      <button onClick={toggleSidebar} className={styles.menuButton}>
        <Menu size={24}/>
      </button>

      {/* El componente de la barra lateral */}
      <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />
      
      {/* El overlay que se activa si la sidebar está abierta */}
      {isSidebarOpen && <div className={styles.overlay} onClick={toggleSidebar} />}
      
      {/* Contenido principal de la página */}
      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;