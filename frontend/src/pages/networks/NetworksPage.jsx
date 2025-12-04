import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Trash2, AlertTriangle, Loader2, Globe, Plus } from 'lucide-react';
import { useToast } from '../../components/ui/toasts/ToastProvider.jsx';
import DataTable from '../../components/ui/table/DataTable.jsx';
import TableActions from '../../components/ui/table/TableActions.jsx';
import Dialog from '../../components/ui/dialog/Dialog.jsx';
import Button from '../../components/ui/button/Button.jsx';
import SearchFilterBar from '../../components/ui/searchbar/SearchFilterBar.jsx';
import DetailViewerCard from '../../components/ui/detailViewer/DetailViewerCard.jsx';
import NetworkConfigForm from '../../components/form/network/NetworkConfigForm.jsx';

// API Services
import { getAllNetworks, createNetwork, deleteNetworkByName } from '../../api/services/networkService.js';
import { getAllServers } from '../../api/services/serverService.js';

import styles from '../Page.module.css';

// Mantenemos esta función de pre-procesamiento fuera del componente para que no se redefina.
const createNetworkSchema = (networkItem, serverCount, serversLoading, serversError) => {
    const serversValue = serversLoading ? 'Cargando...' : serversError ? 'N/A (Error)' : serverCount;

    const details = [
        { label: 'Nombre', value: networkItem.name },
        { label: 'IP', value: networkItem.ipAddress || 'N/A' },
        { label: 'Máscara/Subred', value: networkItem.subnetMask || 'N/A' },
        { label: 'Gateway', value: networkItem.gateway || 'N/A' },
        { label: 'Servidores Asociados', value: serversValue },
    ];

    return {
        name: networkItem.name,
        description: networkItem.description || '',
        modelPath: networkItem.modelPath || '/assets/models/router.glb',
        type: 'network',
        details: details,
        compatibilityItems: networkItem.compatibleWith || [],
    };
};

const NetworksPage = () => {
    const { showToast } = useToast();
    const [networks, setNetworks] = useState([]);
    const [activeNetwork, setActiveNetwork] = useState(null);
    const activeNetworkRef = useRef(activeNetwork);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [networkToDelete, setNetworkToDelete] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Estados para datos extra (Servidores por Red)
    const [serverCount, setServerCount] = useState(null);
    const [serversLoading, setServersLoading] = useState(false);
    const [serversError, setServersError] = useState(null);

    // --- 1. FUNCIÓN CENTRAL DE FETCH ---
    // We intentionally do not include `activeNetwork` in dependencies to
    // avoid re-defining this callback on every activeNetwork change and
    // causing an infinite fetch loop. Use a ref to read the current active network.
    const fetchAndSetNetworks = useCallback(async (initialLoad = false) => {
        setLoading(true);
        setError(null);

        try {
            const data = await getAllNetworks();
            setNetworks(data || []);

            const currentActive = activeNetworkRef.current;
            if (data.length > 0 && (initialLoad || !currentActive)) {
                setActiveNetwork(data[0]);
            }
        } catch (err) {
            console.error('Error al cargar las redes:', err);
            setError('Error al obtener las redes. Asegúrate de que el backend esté funcionando.');
            showToast('Error de conexión con el servidor.', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    // --- 2. EFECTO DE CARGA INICIAL ---
    useEffect(() => {
        fetchAndSetNetworks(true);
    }, [fetchAndSetNetworks]);

    // Keep a ref in sync — so the callback can read the up-to-date value
    useEffect(() => {
        activeNetworkRef.current = activeNetwork;
    }, [activeNetwork]);

    // --- 3. Gestión de datos extra (Servers) cuando se selecciona una red ---
    useEffect(() => {
        if (activeNetwork) {
            const fetchServersCount = async () => {
                setServersLoading(true);
                setServersError(null);

                try {
                    const allServers = await getAllServers();
                    const relatedServers = (allServers || []).filter(s => s.network === activeNetwork.name);
                    setServerCount(relatedServers.length);
                } catch (err) {
                    console.error('Error al obtener servidores:', err);
                    setServersError('Error');
                } finally {
                    setServersLoading(false);
                }
            };
            fetchServersCount();
        } else {
            setServerCount(null);
            setServersError(null);
        }
    }, [activeNetwork]);

    // --- 4. CREACIÓN DEL SCHEMA PARA EL DETAIL VIEWERCARD ---
    const detailsSchema = useMemo(() => {
        if (!activeNetwork) return null;
        return createNetworkSchema(activeNetwork, serverCount, serversLoading, serversError);
    }, [activeNetwork, serverCount, serversLoading, serversError]);

    // Filtrado y búsqueda
    const filteredNetworks = useMemo(() => {
        if (!searchTerm) return networks;
        const lower = searchTerm.toLowerCase();
        return (networks || []).filter(n =>
            (n.name && n.name.toLowerCase().includes(lower)) ||
            (n.ipAddress && n.ipAddress.toLowerCase().includes(lower))
        );
    }, [networks, searchTerm]);

    // Definición de columnas
    const columns = useMemo(() => [
        {
            header: 'Nombre de la Red',
            key: 'name',
            sortable: true,
            render: (item) => (
                <div
                    className={`${styles.nameCellLink} ${item.name === activeNetwork?.name ? styles.activeName : ''}`}
                    onClick={() => handleTableAction('view', item.name)}
                >
                    {item.name}
                </div>
            )
        },
        {
            header: 'IP / Subred',
            key: 'subnet',
            sortable: true,
            render: (item) => (
                <span className={styles.networkCell}>
                    {item.subnetMask || item.ipAddress || 'N/A'}
                </span>
            )
        },
        {
            header: 'Gateway',
            key: 'gateway',
            sortable: true,
            render: (item) => <span>{item.gateway || 'N/A'}</span>
        },
        {
            header: 'Acciones',
            key: 'actions',
            className: styles.centerAlign,
            render: (item) => (
                <TableActions
                    itemId={item.name}
                    onViewDetails={(name) => handleTableAction('view', name)}
                    onEdit={(name) => handleTableAction('edit', name)}
                    onDelete={(name) => handleTableAction('delete', name)}
                />
            )
        }
    ], [activeNetwork]);

    // Contenido condicional para la lista/tabla
    const listContent = useMemo(() => {
        if (loading) {
            return (
                <div className={styles.loadingState}>
                    <Loader2 size={36} className="animate-spin" />
                    <p>Cargando redes...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className={styles.emptyState}>
                    <AlertTriangle size={48} className={styles.errorIcon} />
                    <p>Ocurrió un error al cargar los datos.</p>
                    <p className={styles.errorText}>{error}</p>
                    <Button variant="secondary" onClick={() => fetchAndSetNetworks(true)}>Reintentar Carga</Button>
                </div>
            );
        }

        if (!filteredNetworks || filteredNetworks.length === 0) {
            if (searchTerm) {
                return (
                    <div className={styles.emptyState}>
                        <AlertTriangle size={48} className={styles.emptyIcon} />
                        <p>No se encontraron Redes que coincidan con "{searchTerm}".</p>
                    </div>
                );
            }
            return (
                <div className={styles.emptyState}>
                    <AlertTriangle size={48} className={styles.emptyIcon} />
                    <p>No tienes Redes activas. ¡Crea la primera para empezar!</p>
                </div>
            );
        }

        return (
            <DataTable
                data={filteredNetworks}
                columns={columns}
                initialSortBy="name"
                initialSortDirection="asc"
            />
        );
    }, [loading, error, filteredNetworks, searchTerm, columns, fetchAndSetNetworks]);

    // Handlers
    const handleTableAction = (action, name) => {
        const network = networks.find(n => n.name === name);
        if (!network) return;

        if (action === 'delete') {
            handleDeleteNetwork(network);
        } else if (action === 'view') {
            setActiveNetwork(network);
            showToast(`Visualizando detalles de ${network.name}.`, 'info');
        } else if (action === 'edit') {
            showToast(`Simulando la edición para Red: ${network.name}`, 'info');
        }
    };

    const handleDeleteNetwork = (network) => {
        setNetworkToDelete(network);
        setIsDeleteModalOpen(true);
    };

    const handleCloseNewNetworkModal = (creationSuccessful = false) => {
        setIsCreateModalOpen(false);
        if (creationSuccessful) fetchAndSetNetworks();
    };

    const handleConfirmDelete = async () => {
        if (!networkToDelete) return;

        try {
            await deleteNetworkByName(networkToDelete.name);
            const updated = networks.filter(n => n.name !== networkToDelete.name);
            setNetworks(updated);
            if (activeNetwork?.name === networkToDelete.name) setActiveNetwork(updated[0] || null);
            showToast(`Red "${networkToDelete.name}" eliminada.`, 'error');
        } catch (err) {
            console.error('Error al eliminar la red:', err);
            showToast('Error al eliminar la red.', 'error');
        } finally {
            setIsDeleteModalOpen(false);
            setNetworkToDelete(null);
        }
    };

    const handleCreateNetwork = async (networkData) => {
        try {

            const response = await createNetwork(networkData);

            const newNetwork = response.network;
            showToast(`Red '${newNetwork.name}' creada con éxito.`, 'success');

            await fetchAndSetNetworks();
            setIsCreateModalOpen(false);
            
        } catch (err) {
            console.error('Error al crear la red:', err);
            showToast('Error al crear la red.', 'error');
        }
    };

    const handleFilterClick = () => {
        showToast('Abriendo opciones avanzadas de filtro de redes.', 'info');
    };

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1>Redes</h1>
            </div>

            <div className={styles.contentGrid}>
                {/* Columna de Visualización / Detalles */}
                <div className={styles.visualizerColumn}>
                    {detailsSchema ? (
                        <DetailViewerCard
                            name={detailsSchema.name}
                            description={detailsSchema.description}
                            modelPath={detailsSchema.modelPath}
                            details={detailsSchema.details}
                            type={detailsSchema.type}
                            compatibilityItems={detailsSchema.compatibilityItems}
                        />
                    ) : (
                        <div className={styles.viewerCardPlaceholder}>
                            <h3>{loading ? 'Cargando lista inicial...' : 'Selecciona una Red'}</h3>
                            <p>Haz clic en el nombre para visualizar los detalles.</p>
                        </div>
                    )}
                </div>

                {/* Columna de Lista */}
                <div className={styles.listColumn}>
                    {!loading && !error && (
                        <SearchFilterBar
                            onSearchChange={setSearchTerm}
                            onFilterClick={handleFilterClick}
                            searchPlaceholder="Buscar por nombre, IP o descripción..."
                        />
                    )}

                    <div className={styles.tableContainer}>
                        {listContent}
                    </div>

                    <div className={styles.listColumnFooter}>
                        <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
                            <Plus size={24} style={{ marginRight: '5px' }} />
                            Crear Red
                        </Button>
                    </div>
                </div>
            </div>

            {/* Dialogos (Creación y Eliminación) */}
            <Dialog 
            isOpen={isCreateModalOpen} 
            onClose={() => setIsCreateModalOpen(false)}>
                <NetworkConfigForm
                    onClose={handleCloseNewNetworkModal}
                    onSubmit={handleCreateNetwork}
                />
            </Dialog>

            <Dialog isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
                <div className={styles.dialogContent}>
                    <header className={`${styles.dialogHeader} ${styles.dialogDanger}`}>
                        <AlertTriangle size={24} style={{ marginRight: '10px' }} />
                        <h2 className={styles.dialogTitle}>Confirmar Eliminación: {networkToDelete?.name}</h2>
                    </header>

                    <div className={styles.dialogBody}>
                        <p className={styles.dialogWarningText}>
                            Estás a punto de eliminar la red <strong>{networkToDelete?.name}</strong>.
                            Esta acción es irreversible y toda la información asociada se perderá.
                            ¿Estás seguro de continuar?
                        </p>
                    </div>

                    <footer className={styles.dialogFooter}>
                        <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</Button>
                        <Button variant="danger" onClick={handleConfirmDelete}>
                            <Trash2 size={18} /> Eliminar Permanentemente
                        </Button>
                    </footer>
                </div>
            </Dialog>
        </div>
    );
};

export default NetworksPage;