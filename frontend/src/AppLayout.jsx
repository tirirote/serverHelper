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
import ServerDetailsPage from './pages/servers/ServerDetailsPage.jsx';
import MyComponents from './pages/components/MyComponents.jsx';

const AppLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const handleSidebarToggle = () => {
        setIsSidebarOpen(prev => !prev);
    };

    return (
        <div className={styles.appLayout}>
            {isSidebarOpen && (
                <div
                    className={styles.overlay}
                    onClick={() => setIsSidebarOpen(false)}
                    aria-label="Cerrar menú lateral"
                />
            )}

            <Sidebar
                isOpen={isSidebarOpen}
                onToggle={handleSidebarToggle}
            />

            <div className={`${styles.contentWrapper} ${isSidebarOpen ? styles.contentShift : ''}`}>
                <main className={styles.mainContent}>
                    <Routes>
                        <Route path="/dashboard" element={<Playground />} />
                        <Route path="/workspaces" element={<Workspaces />} />
                        <Route path="/workspaces/:workspaceId" element={<WorkspaceDetailsPage />} />
                        <Route path="/shop" element={<ShopPage />} />
                        <Route path="/shop/:itemId" element={<ShopPageDetails />} />
                        <Route path="/components" element={<MyComponents />} />
                        <Route path="/components/:componentId" element={<Playground />} />
                        <Route path="/servers" element={<ServersPage />} />
                        <Route path="/servers/:serverId" element={<ServerDetailsPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="*" element={<Playground />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};

export default AppLayout;