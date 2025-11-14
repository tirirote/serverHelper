import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Home, Settings, Server, Package, PlusCircle, Wifi, Database, Trash, StickyNote, Eye } from 'lucide-react';
import Button from '../../components/ui/button/Button.jsx';
import DataTable from '../../components/ui/table/DataTable.jsx';
import TableActions from '../../components/ui/table/TableActions.jsx';
import Dialog from '../../components/ui/dialog/Dialog.jsx';
import Input from '../../components/ui/input/InputField.jsx';
import { useToast } from '../../components/ui/toasts/ToastProvider.jsx';
import styles from './WorkspaceDetailsPage.module.css';
import InfoPill from '../../components/ui/infopill/InfoPill.jsx';
import Rack3DViewerCard from '../../components/3d/rack/Rack3DViewerCard.jsx';

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
    racks: [
        { id: 'r-1', name: 'Rack-01 (Front-End)', servers: 4, location: 'Row A', status: 'Online', cost: 1200.50, health: 'Excellent', power: 'ON' },
        { id: 'r-2', name: 'Rack-02 (Back-End)', servers: 6, location: 'Row B', status: 'Warning', cost: 850.00, health: 'Degraded', power: 'ON' },
        { id: 'r-3', name: 'Rack-03 (Testing)', servers: 2, location: 'Row C', status: 'Offline', cost: 400.75, health: 'Failure', power: 'OFF' },
        { id: 'r-4', name: 'Rack-04 (Storage)', servers: 10, location: 'Row A', status: 'Online', cost: 1550.90, health: 'Default', power: 'ON' },
    ],
    inventory: [
        { id: 'i-1', name: 'CPU Intel i9-14900K', type: 'Processor', quantity: 10 },
        { id: 'i-2', name: 'RAM Corsair Vengeance 32GB', type: 'Memory', quantity: 30 },
        { id: 'i-3', name: 'SSD Samsung 990 Pro 1TB', type: 'Storage', quantity: 15 },
    ]
};

const WorkspaceDetailsPage = () => {
    const { workspaceId } = useParams();
    const workspace = mockWorkspaceData;

    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isRackModalOpen, setIsRackModalOpen] = useState(false);
    const [newRackName, setNewRackName] = useState('');


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

    const handleRackAction = (action, id) => {
        const rack = workspace.racks.find(r => r.id === id);
        if (!rack) return;

        showToast(`Acción '${action}' en el Rack: ${rack.name}`, 'info');
        // Aquí se implementaría la navegación a RackDetailsPage o la lógica de edición/eliminación
    };

    const renderHeaderInfo = () => (
        // Se aplica la clase .headerInfo definida en el CSS externo
        <div>
            <div className={styles.headerInfo}>

                {/* Red Asignada */}
                <InfoPill icon={Wifi} label="Red Asignada" value={workspace.network} color="blue" />
                {/* Estado de Salud General */}
                <InfoPill icon={Eye} label="Estado General" value={workspace.healthStatus} color={workspace.healthStatus === 'Excellent' ? 'green' : 'yellow'} />

                {/* Fecha de Creación */}
                <InfoPill icon={Database} label="Creado" value={workspace.creationDate} color="gray" />

            </div>
            <div className={styles.descriptionInfo}>
                <InfoPill icon={StickyNote} label="Descripción" value={workspace.description} color="gray" isDescription={true} />
            </div>
        </div>

    );

    const renderRacksTab = () => (
        <>
            <div className={styles.tabActions}>
                <Button variant="primary" onClick={() => setIsRackModalOpen(true)}>
                    <PlusCircle size={20} />
                    Añadir Nuevo Rack
                </Button>
            </div>
            {/* Se usa una cuadrícula simple (no definida en el CSS provisto, por lo que usaremos una clase genérica) */}
            <div className={styles.rackGrid}>
                {workspace.racks.map(rack => (
                    // Uso del componente externo Rack3DViewerCard
                    <Rack3DViewerCard key={rack.id} rack={rack} onAction={handleRackAction} />
                ))}
            </div>
            {workspace.racks.length === 0 && (
                <div className={styles.emptyRackGrid} >
                    Aún no hay Racks creados en este Workspace. ¡Comienza añadiendo uno!
                </div>
            )}
        </>
    );

    // Columnas de la tabla de Inventario (usa TableActions que también es externo)
    const inventoryColumns = [
        { header: 'Componente', key: 'name' },
        { header: 'Tipo', key: 'type' },
        { header: 'Cantidad Disponible', key: 'quantity', className: 'text-center' },
        {
            header: 'Acciones',
            key: 'actions',
            className: 'text-center',
            render: (item) => (
                <TableActions
                    itemId={item.id}
                    onViewDetails={() => showToast(`Ver detalles de ${item.name}`, 'info')}
                    onDelete={() => showToast(`Eliminando ${item.name}`, 'danger')}
                />
            )
        }
    ];

    const renderInventoryTab = () => (
        <>
            <div className={styles.tabActions}>

                <p className={styles.inventoryIntro}>
                    Este inventario muestra los componentes físicos disponibles para construir servidores dentro de este Workspace.
                </p>
                <Button variant="secondary" onClick={() => showToast('Abriendo gestor de componentes...', 'info')}>
                    <Package size={20} />
                    Gestionar Componentes (WIP)
                </Button>
            </div>
            {/* Aquí se utilizaría un DataTable o ComponentGallery para mostrar el inventario */}
            <DataTable
                data={workspace.inventory}
                columns={inventoryColumns}
                initialSortBy="name"
            />
        </>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'racks':
                return renderRacksTab();
            case 'inventory':
                return renderInventoryTab();
            default:
                return renderRacksTab();
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
