import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Sidebar from './components/sidebar/Sidebar.jsx';
import styles from './AppLayout.module.css';

//Pages
import WelcomePage from './pages/welcome/WelcomePage.jsx';
import Playground from './pages/Playground.jsx';
import Workspaces from './pages/workspaces/WorkspacesPage.jsx';
import WorkspaceDetailsPage from './pages/workspaces/WorkspaceDetailsPage.jsx';
import ShopPage from './pages/shop/ShopPage.jsx';
import ShopPageDetails from './pages/shop/ShopPageDetails.jsx';
import ServersPage from './pages/servers/ServersPage.jsx';
import ServerDetailsPage from './pages/servers/ServerDetailsPage.jsx';
import MyComponents from './pages/components/MyComponents.jsx';
import DashboardPage from './pages/dashboard/DashboardPage.jsx';
import NetworksPage from './pages/networks/NetworksPage.jsx';
import MyRacksPage from './pages/racks/MyRacksPage.jsx';

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
                <div className={styles.mainContent}>
                    <Routes>
                        <Route path="/workspaces" element={<Workspaces />} />
                        <Route path="/workspaces/:workspaceId" element={<WorkspaceDetailsPage />} />
                        <Route path="/networks" element={<NetworksPage />} />
                        <Route path="/shop" element={<ShopPage />} />
                        <Route path="/shop/:itemName" element={<ShopPageDetails />} />
                        <Route path="/components" element={<MyComponents />} />
                        <Route path="/components/:componentId" element={<Playground />} />
                        <Route path="/servers" element={<ServersPage />} />
                        <Route path="/servers/:serverId" element={<ServerDetailsPage />} />
                        <Route path="/playground" element={<Playground />} />
                        <Route path="/racks" element={<MyRacksPage />} />
                        <Route path="*" element={<Workspaces />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
};

export default AppLayout;