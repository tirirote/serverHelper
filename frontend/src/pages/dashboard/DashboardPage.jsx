// src/pages/Dashboard/DashboardPage.jsx
import React from 'react';
import styles from './Dashboard.module.css';

// Podríamos importar un componente de Card o StatsCard que crearíamos luego
// import StatsCard from '../../components/ui/card/StatsCard.jsx'; 
// import ActivityLog from '../../components/modules/ActivityLog.jsx';

const DashboardPage = () => {
    return (
        <div className={styles.dashboardContainer}>
            <header className={styles.header}>
                <h1>Panel de Control del Workspace</h1>
                <p>Resumen del estado operativo y la actividad reciente del inventario y la red.</p>
            </header>

            {/* Sección de Estadísticas Clave */}
            <section className={styles.statsGrid}>
                {/* Aquí irían las Cards (ej: Total Componentes, IPs Libres, Servidores Activos) */}
                <div className={styles.statPlaceholder}>Total de Componentes: 124</div>
                <div className={styles.statPlaceholder}>Redes Config.</div>
                <div className={styles.statPlaceholder}>Servidores Activos: 8</div>
                <div className={styles.statPlaceholder}>Inventario Crítico</div>
            </section>

            {/* Sección de Actividad Reciente */}
            <section className={styles.recentActivity}>
                <h2>Actividad Reciente</h2>
                <div className={styles.logPlaceholder}>
                    <ul>
                        <li>[10:30] Servidor 'Web-Prod-01' reiniciado.</li>
                        <li>[10:15] Componente 'RAM 32GB' agregado al inventario.</li>
                        <li>[09:45] Subred 'Dev-Zone' modificada.</li>
                    </ul>
                </div>
            </section>
        </div>
    );
};

export default DashboardPage;