import React, { useState, useEffect } from 'react';
import styles from '../Page.module.css';
import Tabs from '../../components/ui/tabs/Tabs.jsx';
import DetailViewerCard from '../../components/ui/detailViewer/DetailViewerCard.jsx';
import { createWorkspaceSchema, createRackSchema, createServerSchema, createComponentSchema } from '../../components/ui/detailViewer/detailSchemas.js';
import WorkspacesTab from './tabs/WorkspacesTab.jsx';
import RacksTab from './tabs/RacksTab.jsx';
import ServersTab from './tabs/ServersTab.jsx';
import ComponentsTab from './tabs/ComponentsTab.jsx';
import NetworksTab from './tabs/NetworksTab.jsx';

const DashboardPage = () => {
    const [activeTab, setActiveTab] = useState('workspaces');
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedSchema, setSelectedSchema] = useState(null);

    // Dashboard tabs fetch and render their own data; selected schema derived from onSelectItem in tabs.
    const tabs = [
        { key: 'workspaces', label: 'Workspaces', content: <WorkspacesTab onSelectItem={setSelectedItem} /> },
        { key: 'racks', label: 'Racks', content: <RacksTab onSelectItem={setSelectedItem} /> },
        { key: 'servers', label: 'Servidores', content: <ServersTab onSelectItem={setSelectedItem} /> },
        { key: 'components', label: 'Componentes', content: <ComponentsTab onSelectItem={setSelectedItem} /> },        
        { key: 'networks', label: 'Redes', content: <NetworksTab onSelectItem={setSelectedItem} /> },
    ];

    useEffect(() => {
        if (!selectedItem) { setSelectedSchema(null); return; }
        const type = selectedItem.type || selectedItem?.__type || '';
        switch (type) {
            case 'workspace': setSelectedSchema(createWorkspaceSchema(selectedItem)); break;
            case 'rack': setSelectedSchema(createRackSchema(selectedItem)); break;
            case 'server': setSelectedSchema(createServerSchema(selectedItem)); break;
            case 'component': setSelectedSchema(createComponentSchema(selectedItem)); break;
            default: setSelectedSchema({ name: selectedItem.name, description: selectedItem.description || '', modelPath: selectedItem.modelPath || '', details: [], type: 'unknown', compatibilityItems: [] });
        }
    }, [selectedItem]);

    return (
        <div className={styles.page}>
            <div className={styles.header}><h1>Dashboard</h1></div>
            <div className={styles.contentGrid}>
                <div className={styles.visualizerColumn}>
                    <DetailViewerCard {...(selectedSchema || {})} />
                </div>
                <div className={styles.tabColumn}>
                    <Tabs tabs={tabs} activeKey={activeTab} onChange={setActiveTab} />
                </div>

            </div>
        </div>
    );
};

export default DashboardPage;