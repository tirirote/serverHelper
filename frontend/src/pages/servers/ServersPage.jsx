import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Trash2, AlertTriangle, Server, Cpu, Save } from 'lucide-react';
import { useToast } from '../../components/ui/toasts/ToastProvider.jsx';
import DataTable from '../../components/ui/table/DataTable.jsx';
import TableActions from '../../components/ui/table/TableActions.jsx';
import Dialog from '../../components/ui/dialog/Dialog.jsx';
import Input from '../../components/ui/input/InputField.jsx';
import Button from '../../components/ui/button/Button.jsx';
import SearchFilterBar from '../../components/ui/searchbar/SearchFilterBar.jsx';
import DetailViewerCard from '../../components/ui/detailViewer/DetailViewerCard.jsx';

import styles from './ServersPage.module.css'; // 🚨 Importación del módulo de estilos

// MOCK Data para servidores
const initialServers = [
    {
        id: 'srv-101', name: 'Web Server Prod EU', os: 'Ubuntu 22.04', status: 'Running', cpu: '8 Cores', ram: '32 GB',
        description: 'Servidor de producción principal para la web.', region: 'europe-west1',
    },
    {
        id: 'srv-102', name: 'Database Staging US', os: 'CentOS 8', status: 'Stopped', cpu: '16 Cores', ram: '64 GB',
        description: 'Instancia de base de datos para entorno de pruebas.', region: 'us-east4',
    },
    {
        id: 'srv-103', name: 'Dev VM Asia', os: 'Debian 11', status: 'Starting', cpu: '4 Cores', ram: '16 GB',
        description: 'Máquina virtual para desarrolladores en Asia.', region: 'asia-southeast2',
    },
    {
        id: 'srv-104', name: 'Load Balancer LB-1', os: 'Custom Linux', status: 'Running', cpu: '2 Cores', ram: '8 GB',
        description: 'Balanceador de carga frontal de alto tráfico.', region: 'europe-west1',
    },
];

const ServersPage = () => {
    const navigate = useNavigate();
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

    // Maneja la creación de un nuevo servidor (MOCKS de lógica)
    const handleCreateServer = (e) => {
        e.preventDefault();
        if (newServerName.trim() === '') {
            showToast('El nombre del Servidor no puede estar vacío.', 'warning');
            return;
        }

        const newServer = {
            id: `srv-${Date.now()}`,
            name: newServerName.trim(),
            os: newServerOS,
            status: 'Starting',
            cpu: '4 Cores',
            ram: '16 GB',
            description: `Servidor customizado creado por el usuario.`,
            region: 'local-zone',
        };

        setServers(prev => [newServer, ...prev]);
        showToast(`Servidor "${newServer.name}" creado y está iniciando.`, 'success');

        setNewServerName('');
        setNewServerOS('Ubuntu 22.04');
        setIsCreateModalOpen(false);
    };

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
            header: 'ID',
            key: 'id',
            render: (item) => <span>{item.id}</span>
        },
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
            key: 'os',
            render: (item) => <span>{item.os}</span>
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
        <div className={styles.serversPage}>
            <header className={styles.header}>
                <h1 className={styles.title}>
                    Mis Servidores
                </h1>
            </header>

            {/* 4. 📐 Implementación de la cuadrícula de dos columnas */}
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
                            <PlusCircle size={20} style={{ marginRight: '5px' }} />
                            Crear Servidor
                        </Button>
                    </div>


                </div>
            </div>

            {/* Diálogos (Creación y Eliminación) - Se mantienen sin cambios */}
            <Dialog isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
                <form onSubmit={handleCreateServer} className={styles.dialogForm}>
                    <header className={styles.dialogHeader}>
                        <h2 className={styles.dialogTitle}>Crear Nuevo Servidor</h2>
                    </header>
                    <div className={styles.dialogBody}>
                        <Input
                            id="serverName"
                            label="Nombre del Servidor"
                            type="text"
                            value={newServerName}
                            onChange={(e) => setNewServerName(e.target.value)}
                            placeholder="Ej: Prod API Gateway"
                            required
                        />
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-300 mb-1">Sistema Operativo</label>
                            <select
                                value={newServerOS}
                                onChange={(e) => setNewServerOS(e.target.value)}
                                className={styles.selectInput}
                            >
                                <option value="Ubuntu 22.04">Ubuntu 22.04 (Recomendado)</option>
                                <option value="Debian 12">Debian 12</option>
                                <option value="CentOS 8">CentOS 8</option>
                                <option value="Windows Server 2022">Windows Server 2022</option>
                            </select>
                        </div>
                        <p className="text-sm text-gray-400 mt-2">* Se crearán con recursos estándar (4 Cores / 16 GB RAM).</p>
                    </div>
                    <footer className={styles.dialogFooter}>
                        <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)} type="button">Cancelar</Button>
                        <Button variant="primary" type="submit"><Save size={18} style={{ marginRight: '5px' }} />Crear e Iniciar</Button>
                    </footer>
                </form>
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