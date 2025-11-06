import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Sidebar from './components/sidebar/Sidebar.jsx';
import styles from './AppLayout.module.css';

//Pages
import ProfilePage from './pages/profile/ProfilePage.jsx';
import WelcomePage from './pages/welcome/WelcomePage.jsx';
import Playground from './pages/Playground.jsx';
import Workspaces from './pages/workspaces/WorkspacesPage.jsx';
import WorkspaceDetailsPage from './pages/workspaces/WorkspaceDetailsPage.jsx';
import ShopPage from './pages/shop/ShopPage.jsx';
import ShopPageDetails from './pages/shop/ShopPageDetails.jsx';
import ServersPage from './pages/servers/ServersPage.jsx';
const AppLayout = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    // CAMBIO: Establecer a false para que esté contraído por defecto
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogin = () => {
        setIsAuthenticated(true);
        navigate('/dashboard');
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        navigate('/');
    };

    const handleSidebarToggle = () => {
        setIsSidebarOpen(prev => !prev);
    };

    if (isAuthenticated) {
        return (
            <div className={styles.appLayout}>

                {/* OVERLAY: Visible cuando el sidebar está abierto */}
                {isSidebarOpen && (
                    <div
                        className={styles.overlay}
                        onClick={() => setIsSidebarOpen(false)} // Cierra el sidebar al pulsar el overlay
                        aria-label="Cerrar menú lateral"
                    />
                )}

                <Sidebar
                    isOpen={isSidebarOpen}
                    handleLogout={handleLogout}
                    onToggle={handleSidebarToggle} // Pasamos la función de toggle al Sidebar
                />

                <div className={`${styles.contentWrapper} ${isSidebarOpen ? styles.contentShift : ''}`}>
                    <main className={styles.mainContent}>
                        <Routes>
                            <Route path="/dashboard" element={<Playground handleLogout={handleLogout} />} />
                            <Route path="/workspaces" element={<Workspaces />} />
                            <Route path="/workspaces/:workspaceId" element={<WorkspaceDetailsPage />} />
                            <Route path="/shop" element={<ShopPage handleLogout={handleLogout} />} />
                            <Route path="/shop/:itemId" element={<ShopPageDetails handleLogout={handleLogout} />} />
                            <Route path="/components" element={<Playground handleLogout={handleLogout} />} />
                            <Route path="/servers" element={<ServersPage handleLogout={handleLogout} />} />
                            <Route path="/profile" element={<ProfilePage />} />
                            <Route path="*" element={<Playground handleLogout={handleLogout} />} />
                        </Routes>
                    </main>
                </div>
            </div>
        );
    }

    // Estructura para usuarios no autenticados
    return (
        <Routes>
            <Route path="/" element={<WelcomePage onLoginSuccess={handleLogin} />} />
            <Route path="*" element={<WelcomePage onLoginSuccess={handleLogin} />} />
        </Routes>
    );
};

export default AppLayout;