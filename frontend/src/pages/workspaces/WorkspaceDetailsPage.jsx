import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Home, Settings, Server, Package, PlusCircle, Wifi, Database, Users, TrendingUp, HeartPlus, Trash } from 'lucide-react';
import Button from '../../components/ui/button/Button.jsx';
import DataTable from '../../components/ui/table/DataTable.jsx';
import TableActions from '../../components/ui/table/TableActions.jsx';
import Dialog from '../../components/ui/dialog/Dialog.jsx';
import Input from '../../components/ui/input/InputField.jsx';
import { useToast } from '../../components/ui/toasts/ToastProvider.jsx';
import styles from './WorkspaceDetailsPage.module.css';

// ===============================================
// MOCK DATA
// ===============================================

// Simulación de un Workspace completo
const mockWorkspaceData = {
    id: 'ws-1',
    name: 'Project Chimera',
    description: 'Entorno para el desarrollo principal de la API.',
    network: 'Default-VPC',
    status: 'Active',
    owner: 'Alice',
    members: 4,
    creationDate: '2024-01-15',
    totalServers: 12,
    totalRacks: 3,
    inventoryCount: 55,
    lastUpdated: 'Hace 2 horas',
    healthStatus: 'Excellent',
    racks: [
        { id: 'r-1', name: 'Rack-01 (Front-End)', servers: 4, location: 'Row A', status: 'Online' },
        { id: 'r-2', name: 'Rack-02 (Back-End)', servers: 6, location: 'Row B', status: 'Warning' },
        { id: 'r-3', name: 'Rack-03 (Testing)', servers: 2, location: 'Row C', status: 'Offline' },
    ],
    inventory: [
        { id: 'i-1', name: 'CPU Intel i9-14900K', type: 'Processor', quantity: 10 },
        { id: 'i-2', name: 'RAM Corsair Vengeance 32GB', type: 'Memory', quantity: 30 },
        { id: 'i-3', name: 'SSD Samsung 990 Pro 1TB', type: 'Storage', quantity: 15 },
    ]
};

const WorkspaceDetailsPage = () => {
    // Usamos useParams para simular la obtención del ID de la URL
    const { workspaceId } = useParams();
    // Por simplicidad, usamos datos mock fijos, ignorando el ID de la URL
    const workspace = mockWorkspaceData;

    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isRackModalOpen, setIsRackModalOpen] = useState(false);
    const [newRackName, setNewRackName] = useState('');

    // ===============================================
    // LÓGICA DE GESTIÓN DE RACKS
    // ===============================================

    const handleCreateRack = (e) => {
        e.preventDefault();
        if (newRackName.trim() === '') {
            showToast('El nombre del Rack no puede estar vacío.', 'warning');
            return;
        }

        // Simular la creación de un rack
        showToast(`Rack "${newRackName}" creado en el Workspace ${workspace.name}`, 'success');
        setNewRackName('');
        setIsRackModalOpen(false);
    };

    // Acciones de la tabla de Racks
    const handleRackAction = (action, id) => {
        const rack = workspace.racks.find(r => r.id === id);
        if (!rack) return;

        showToast(`Acción '${action}' en el Rack: ${rack.name}`, 'info');
        // Aquí se implementaría la navegación a RackDetailsPage o la lógica de edición/eliminación
    };

    const rackColumns = useMemo(() => [
        {
            header: 'Nombre del Rack', key: 'name',
            render: (item) => (
                <div className={styles.nameCell} onClick={() => handleRackAction('view', item.id)}>
                    <Server size={16} style={{ marginRight: '8px' }} />
                    {item.name}
                </div>
            )
        },
        { header: 'Ubicación', key: 'location' },
        { header: 'Servidores', key: 'servers', className: styles.centerAlign },
        { header: 'Estado', key: 'status' },
        {
            header: 'Acciones',
            key: 'actions',
            className: styles.centerAlign,
            render: (item) => (
                <TableActions
                    itemId={item.id}
                    onViewDetails={(id) => handleRackAction('view', id)}
                    onDelete={(id) => handleRackAction('delete', id)}
                />
            )
        },
    ], []);

    const renderHeaderInfo = () => (
        <div className={styles.headerInfo}>
            <div className={styles.infoGroup}>
                <Wifi size={18} className={styles.iconPrimary} />
                <p>Red Asignada: <strong>{workspace.network}</strong></p>
            </div>
            <div className={styles.infoGroup}>
                <Database size={18} className={styles.iconPrimary} />
                <p>Creado: <strong>{workspace.creationDate}</strong></p>
            </div>
            <div className={styles.infoGroup}>
                <TrendingUp size={18} className={styles.iconPrimary} />
                <p>Estado: <strong>{workspace.status}</strong></p>
            </div>
            <div className={styles.infoGroup}>
                <HeartPlus size={18} className={styles.iconPrimary} />
                <p>Salud: <strong>{workspace.healthStatus}</strong></p>
            </div>
        </div>
    );

    const renderDashboardTab = () => (
        <div className={styles.dashboardGrid}>
            <div className={`${styles.statsCard} ${styles.statServers}`}>
                <h2>Servidores</h2>
                <p className={styles.statNumber}>{workspace.totalServers}</p>
            </div>
            <div className={`${styles.statsCard} ${styles.statRacks}`}>
                <h2>Racks</h2>
                <p className={styles.statNumber}>{workspace.totalRacks}</p>
            </div>
            <div className={styles.statsCard}>
                <h2>Descripción</h2>
                <p>{workspace.description}</p>
            </div>
        </div>
    );

    const renderRacksTab = () => (
        <>
            <div className={styles.tabActions}>
                <Button variant="secondary" onClick={() => setIsRackModalOpen(true)}>
                    <PlusCircle size={20} />
                    Añadir Nuevo Rack
                </Button>
            </div>
            <DataTable
                data={workspace.racks}
                columns={rackColumns}
                initialSortBy="name"
            />
        </>
    );

    const renderInventoryTab = () => (
        <>
            <div className={styles.tabActions}>
                <Button variant="secondary" onClick={() => showToast('Abriendo gestor de componentes...', 'info')}>
                    <Package size={20} />
                    Gestionar Componentes (WIP)
                </Button>
            </div>
            <p className={styles.inventoryIntro}>
                Este inventario muestra los componentes físicos disponibles para construir servidores dentro de este Workspace.
            </p>
            {/* Aquí se utilizaría un DataTable o ComponentGallery para mostrar el inventario */}
            <DataTable
                data={workspace.inventory}
                columns={[
                    { header: 'Componente', key: 'name' },
                    { header: 'Tipo', key: 'type' },
                    { header: 'Cantidad Disponible', key: 'quantity'},
                ]}
                initialSortBy="name"
            />
        </>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return renderDashboardTab();
            case 'racks':
                return renderRacksTab();
            case 'inventory':
                return renderInventoryTab();
            default:
                return null;
        }
    };

    if (!workspace) {
        return <div className={styles.workspacesPage}>Workspace no encontrado.</div>;
    }

    return (
        <div className={styles.detailsContainer}>
            <div className={styles.titleGroup}>
                <h1>Workspace: {workspace.name}</h1>
            </div>

            {renderHeaderInfo()}
            {/* Navegación por Pestañas */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tabButton} ${activeTab === 'dashboard' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('dashboard')}
                >
                    <Home size={18} /> Dashboard
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'racks' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('racks')}
                >
                    <Server size={18} /> Racks & Servidores
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'inventory' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('inventory')}
                >
                    <Package size={18} /> Inventario
                </button>
            </div>

            <hr className={styles.divider} />

            <div className={styles.content}>
                {renderContent()}
            </div>
            <div className={styles.bottomActions}>
                <Button variant="secondary" onClick={() => showToast('Abriendo Configuración...', 'info')}>
                    <Settings size={20} />
                    Configuración
                </Button>
                <Button variant="danger" onClick={() => showToast('Eliminando Workspace...', 'error')}>
                    <Trash size={20} />
                    Eliminar
                </Button>
            </div>


            {/* Diálogo de Creación de Rack */}
            <Dialog
                isOpen={isRackModalOpen}
                onClose={() => setIsRackModalOpen(false)}
            >
                <form onSubmit={handleCreateRack} className={styles.dialogForm}>
                    <header className={styles.dialogHeader}>
                        <h2 className={styles.dialogTitle}>Añadir Nuevo Rack a {workspace.name}</h2>
                    </header>

                    <div className={styles.dialogBody}>
                        <Input
                            id="rackName"
                            label="Nombre del Rack"
                            type="text"
                            value={newRackName}
                            onChange={(e) => setNewRackName(e.target.value)}
                            placeholder="Ej: Rack de Producción Q3"
                            required
                        />
                    </div>

                    <footer className={styles.dialogFooter}>
                        <Button variant="secondary" onClick={() => setIsRackModalOpen(false)} type="button">
                            Cancelar
                        </Button>
                        <Button variant="primary" type="submit">
                            <PlusCircle size={18} />
                            Crear Rack
                        </Button>
                    </footer>
                </form>
            </Dialog>
        </div>
    );
};

export default WorkspaceDetailsPage;
