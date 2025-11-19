import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Trash2, AlertTriangle, Server, Cpu, Save, Plus } from 'lucide-react';
import { useToast } from '../../components/ui/toasts/ToastProvider.jsx';
import DataTable from '../../components/ui/table/DataTable.jsx';
import TableActions from '../../components/ui/table/TableActions.jsx';
import Dialog from '../../components/ui/dialog/Dialog.jsx';
import Input from '../../components/ui/input/InputField.jsx';
import Button from '../../components/ui/button/Button.jsx';
import SearchFilterBar from '../../components/ui/searchbar/SearchFilterBar.jsx';
import DetailViewerCard from '../../components/ui/detailViewer/DetailViewerCard.jsx';
import styles from './ServersPage.module.css';
import NewServerForm from '../../components/form/server/NewServerForm.jsx';

// MOCK Data para servidores
const initialServers = [
    {
        id: 'srv-101',
        name: 'Web Server Prod EU',
        description: 'Servidor de producción principal para la web.',
        components: [
            // --- Componente 1: Servidor Base (Proporcionado por el usuario) ---
            {
                id: 'i-101',
                name: 'Servidor Base R-10',
                category: 'Server',
                description: 'Servidor genérico de 1U, ideal para desarrollo.',
                price: 1200.00,
                maintenanceCost: 15.00,
                estimatedConsumption: 150, // Consumo en Watts (W)
                compatibleWith: [
                    // Esto asume que estos IDs (1, 2, 3) corresponden a otros componentes/accesorios
                    { id: 1, name: 'Rack-1', count: 1 },
                    { id: 2, name: 'Server-1', count: 1 },
                    { id: 3, name: 'Cable-2', count: 1 },
                ],
                modelPath: '/assets/models/server-closed.glb'
            },

            // --- Componente 2: Array de Almacenamiento SSD ---
            {
                id: 'i-102',
                name: 'Array Almacenamiento SSD-T',
                category: 'Storage',
                description: 'Unidad de almacenamiento de estado sólido (NVMe) de alta velocidad, 10TB en configuración RAID.',
                price: 3500.00,
                maintenanceCost: 45.50,
                estimatedConsumption: 80, // Consumo en Watts (W)
                compatibleWith: [
                    { id: 1, name: 'Rack-1', count: 2 }, // Ocupa 2 unidades de Rack
                    { id: 4, name: 'Cable SFP+', count: 4 }, // Necesita 4 cables de fibra
                ],
                modelPath: '/assets/models/nas.glb'
            },

            // --- Componente 3: Switch de Red Core ---
            {
                id: 'i-103',
                name: 'Switch Core 48-Port',
                category: 'Network',
                description: 'Switch de agregación de capa 3 con 48 puertos 10GbE y 4 uplinks 40GbE.',
                price: 5800.00,
                maintenanceCost: 60.00,
                estimatedConsumption: 220, // Consumo en Watts (W)
                compatibleWith: [
                    { id: 1, name: 'Rack-1', count: 1 },
                    { id: 5, name: 'Cable CAT6', count: 48 }, // Puertos de cobre
                    { id: 4, name: 'Cable SFP+', count: 4 },  // Puertos de fibra
                ],
                modelPath: '/assets/models/switch.glb'
            },

            // --- Componente 4: Unidad de Distribución de Energía (PDU) ---
            {
                id: 'i-104',
                name: 'PDU Inteligente 1U',
                category: 'Accessory',
                description: 'Unidad de distribución de energía con medición de consumo por puerto y control remoto.',
                price: 750.00,
                maintenanceCost: 5.00,
                estimatedConsumption: 5, // Consumo de la propia unidad
                compatibleWith: [
                    { id: 1, name: 'Rack-1', count: 1 },
                    { id: 6, name: 'Cable C13/C14', count: 12 }, // Máximo 12 dispositivos conectados
                ],
                modelPath: '/assets/models/ups.glb'
            },

            // --- Componente 5: Módulo de Memoria RAM ECC ---
            {
                id: 'i-105',
                name: 'Memoria RAM 64GB ECC',
                category: 'Memory',
                description: 'Módulo de 64GB DDR4 ECC. Esencial para servidores y workstations.',
                price: 450.00,
                maintenanceCost: 0.00,
                estimatedConsumption: 10, // Por módulo
                compatibleWith: [
                    { id: 'i-101', name: 'Servidor Base R-10', count: 1 }, // Compatible con el Servidor R-10
                    { id: 7, name: 'Workstation T-200', count: 1 },
                ],
                modelPath: '/assets/models/ram.glb'
            },
            {
                id: 'i-106',
                name: 'NVIDIA GForce 4090',
                category: 'GPU',
                description: 'Tarjeta gráfica de alto rendimineto, para Gráficos, diseño y CUDA.',
                price: 1299.00,
                maintenanceCost: 0.00,
                estimatedConsumption: 10, // Por módulo
                compatibleWith: [
                    { id: 'i-101', name: 'Servidor Base R-10', count: 1 }, // Compatible con el Servidor R-10
                    { id: 7, name: 'Workstation T-200', count: 1 },
                ],
                modelPath: '/assets/models/gpu.glb'
            },
        ],
        totalPrice: '2,340',
        totalMaintenanceCost: '63',
        healthStatus: 'Excellent',
        network: '192.168.0.0',
        ipAddress: '192.168.0.2',
        operatingSystem: 'Ubuntu 22.04',
        status: 'Running'
    }
];

const ServersPage = () => {
    const { showToast } = useToast();

    const [servers, setServers] = useState(initialServers);
    const [activeServer, setActiveServer] = useState(initialServers[0] || null);

    // Estados para la creación
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newServerName, setNewServerName] = useState('');
    const [newServerOS, setNewServerOS] = useState('Ubuntu 22.04');

    // Estados para la eliminación
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [serverToDelete, setServerToDelete] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');

    // [NUEVA FUNCIÓN] Manejador para cerrar el modal de creación y mostrar el toast si fue exitoso
    const handleCloseNewServerModal = (creationSuccessful = false) => {
        setIsCreateModalOpen(false);
        if (creationSuccessful) {
            // NewServerForm ya muestra su propio toast de éxito tras la simulación de envío,
            // pero si tuviéramos que añadir los datos del servidor a la lista padre, 
            // la lógica iría aquí. Por ahora, solo cerramos el modal.
        }
    };

    // Lógica de filtrado
    const filteredServers = useMemo(() => {
        if (!searchTerm) {
            return servers;
        }
        const lowerCaseSearch = searchTerm.toLowerCase();
        return servers.filter(srv =>
            srv.name.toLowerCase().includes(lowerCaseSearch) ||
            srv.os.toLowerCase().includes(lowerCaseSearch) ||
            srv.region.toLowerCase().includes(lowerCaseSearch) ||
            srv.id.toLowerCase().includes(lowerCaseSearch)
        );
    }, [servers, searchTerm]);

    // Abre el Dialog de confirmación de eliminación
    const handleDeleteServer = (server) => {
        setServerToDelete(server);
        setIsDeleteModalOpen(true);
    };

    // Finaliza la eliminación después de la confirmación
    const handleConfirmDelete = () => {
        if (!serverToDelete) return;

        setServers(prev => prev.filter(srv => srv.id !== serverToDelete.id));
        showToast(`Servidor "${serverToDelete.name}" eliminado permanentemente.`, 'error');

        setIsDeleteModalOpen(false);
        setServerToDelete(null);
    };

    const handleTableAction = (action, id) => {
        const server = servers.find(srv => srv.id === id);
        if (!server) return;

        if (action === 'delete') {
            handleDeleteServer(server);
        } else if (action === 'view') {
            // 3. ✨ Actualizamos el estado del visor en lugar de navegar
            setActiveServer(server);
            showToast(`Visualizando detalles de ${server.name}.`, 'info');
        }
    };

    const handleFilterClick = () => {
        showToast('Abriendo opciones avanzadas de filtro de servidores.', 'info');
    };

    // Función para obtener la clase de estilo según el estado
    const getStatusClass = (status) => {
        switch (status) {
            case 'Running': return styles.statusRunning;
            case 'Stopped': return styles.statusStopped;
            case 'Starting':
            case 'Pending': return styles.statusStarting;
            default: return 'text-gray-400';
        }
    };

    // Definición de las columnas para el componente DataTable (MOCKS de renderizado)
    const columns = useMemo(() => [
        {
            header: 'Nombre del Servidor',
            key: 'name',
            render: (item) => (
                // Asumiendo que el componente DataTable no requiere la importación de estilos de celda
                <div
                    className={`${styles.nameCellLink} ${item.id === activeServer?.id ? styles.activeName : ''}`}
                    onClick={() => handleTableAction('view', item.id)}>
                    {item.name}
                </div>
            )
        },
        {
            header: 'OS',
            key: 'operatingSystem',
            render: (item) => <span>{item.operatingSystem}</span>
        },
        {
            header: 'Acciones',
            key: 'actions',
            className: styles.centerAlign,
            // NOTA: 'TableActions' es un componente externo, asumimos que se renderiza correctamente
            render: (item) => (
                <TableActions
                    itemId={item.id}
                    onViewDetails={(id) => handleTableAction('view', id)}
                    onDelete={(id) => handleTableAction('delete', id)}
                />
            )
        },
    ], [servers, activeServer]); // Dependencia del useMemo para que las funciones de acción usen el estado actual

    return (
        <div>
            <header className={styles.header}>
                <h1>
                    Mis Servidores
                </h1>
            </header>

            {/* Implementación de la cuadrícula de dos columnas */}
            <div className={styles.contentGrid}>

                {/* Columna de Visualización / Detalles */}
                <div className={styles.visualizerColumn}>
                    <DetailViewerCard
                        item={activeServer} // ⬅️ Le pasamos el servidor activo
                    />
                </div>

                {/* Columna de la Lista y Acciones */}
                <div className={styles.listColumn}>
                    {/* Contenedor de Búsqueda y Botón */}
                    <SearchFilterBar
                        onSearchChange={setSearchTerm}
                        onFilterClick={handleFilterClick}
                        searchPlaceholder="Buscar por nombre, OS, región o ID..."
                    />

                    {/* Renderizado Condicional de la Tabla o Empty State */}
                    {filteredServers.length === 0 && searchTerm ? (
                        <div className={styles.emptyState}>
                            <AlertTriangle size={48} className={styles.emptyIcon} />
                            <p>No se encontraron servidores que coincidan con "{searchTerm}".</p>
                        </div>
                    ) : filteredServers.length === 0 && !searchTerm ? (
                        <div className={styles.emptyState}>
                            <Server size={48} className={styles.emptyIcon} />
                            <p>No tienes servidores activos. ¡Crea el primero para desplegar tu infraestructura!</p>
                        </div>
                    ) : (
                        <div className={styles.tableContainer}>
                            <DataTable
                                data={filteredServers}
                                columns={columns}
                                initialSortBy="name"
                            />
                        </div>
                    )}

                    <div className={styles.listColumnFooter}>
                        <Button
                            variant="primary"
                            onClick={() => setIsCreateModalOpen(true)}
                        >
                            <Plus size={20} style={{ marginRight: '5px' }} />
                            Crear Servidor
                        </Button>
                    </div>


                </div>
            </div>

            {/* Diálogos (Creación y Eliminación) - Se mantienen sin cambios */}
            <Dialog
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}>
                <NewServerForm 
                    // Pasamos la función de cierre para que el formulario la llame tras el envío exitoso
                    onClose={handleCloseNewServerModal} 
                />                
            </Dialog>

            <Dialog isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
                <div className={styles.dialogContent}>
                    <header className={`${styles.dialogHeader} ${styles.dialogDanger}`}>
                        <AlertTriangle size={24} style={{ marginRight: '10px' }} />
                        <h2 className={styles.dialogTitle}>Confirmar Eliminación: {serverToDelete?.name}</h2>
                    </header>
                    <div className={styles.dialogBody}>
                        <p className="text-gray-300">
                            Estás a punto de eliminar el servidor <strong>{serverToDelete?.name}</strong>.
                            Esta acción es irreversible, lo que resultará en la pérdida de la máquina virtual y sus datos.
                            ¿Estás seguro de que quieres terminar la instancia?
                        </p>
                    </div>
                    <footer className={styles.dialogFooter}>
                        <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</Button>
                        <Button variant="danger" onClick={handleConfirmDelete}><Trash2 size={18} style={{ marginRight: '5px' }} />Eliminar Servidor</Button>
                    </footer>
                </div>
            </Dialog>
        </div>
    );
};

export default ServersPage;