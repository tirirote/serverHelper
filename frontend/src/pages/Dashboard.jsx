import React from 'react';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  return (
    <div className={styles.container}>
      <h1>Dashboard</h1>
      <p>Bienvenido al Panel de Control. Esta será la página principal.</p>
      <p>Navega a la ruta **"/playground"** para ver los componentes de la UI.</p>
    </div>
  );
};

export default Dashboard;