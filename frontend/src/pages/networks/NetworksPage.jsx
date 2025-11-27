import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Trash2, AlertTriangle, Loader2, Globe, Plus } from 'lucide-react';
import { useToast } from '../../components/ui/toasts/ToastProvider.jsx';
import DataTable from '../../components/ui/table/DataTable.jsx';
import TableActions from '../../components/ui/table/TableActions.jsx';
import Dialog from '../../components/ui/dialog/Dialog.jsx';
import Button from '../../components/ui/button/Button.jsx';
import styles from './WorkspacesPage.module.css';
import SearchFilterBar from '../../components/ui/searchbar/SearchFilterBar.jsx';
import DetailViewerCard from '../../components/ui/detailViewer/DetailViewerCard.jsx';

import { getAllNetworks } from '../../api/services/networkService.js';

// API Services


// Mantenemos esta función de pre-procesamiento fuera del componente para que no se redefina.
const createNetworkSchema = (networkItem, totalRacks, racksLoading, racksError) => {
    const racksValue = racksLoading
        ? 'Cargando...'
        : racksError
            ? 'N/A (Error de API)'
            : totalRacks;

    const details = [
        { label: 'Nombre', value: workspaceItem.name },
        { label: 'Red', value: workspaceItem.network ? workspaceItem.network.name : 'N/A' },
        { label: 'Racks Totales', value: racksValue },
    ];

    return {
        name: workspaceItem.name,
        description: workspaceItem.description,
        modelPath: workspaceItem.modelPath,
        type: 'workspace',
        details: details,
        compatibilityItems: workspaceItem.compatibleWith || [],
    };
};

const WorkspacesPage = () => {
    const { showToast } = useToast();
    const [workspaces, setWorkspaces] = useState([]);
    const [activeWorkspace, setActiveWorkspace] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [workspaceToDelete, setWorkspaceToDelete] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Estados para datos extra (Racks)
    const [totalRacks, setTotalRacks] = useState(null);
    const [racksLoading, setRacksLoading] = useState(false);
    const [racksError, setRacksError] = useState(null);

    // --- 1. FUNCIÓN CENTRAL DE FETCH (Reemplaza fetchInitialData y refetchWorkspaces) ---
    const fetchAndSetWorkspaces = useCallback(async (initialLoad = false) => {
        setLoading(true);
        setError(null);

        try {
            const data = await getAllWorkspaces();
            setWorkspaces(data);

            // Solo seleccionamos el primer workspace si es la carga inicial
            // o si el workspace activo fue eliminado.
            if (data.length > 0 && (initialLoad || !activeWorkspace)) {
                setActiveWorkspace(data[0]);
            }
        } catch (err) {
            console.error('Error al cargar los workspaces:', err);
            setError('Error al obtener los workspaces. Asegúrate de que el backend esté funcionando.');
            showToast('Error de conexión con el servidor.', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]); // Mantener activeWorkspace para la lógica de re-selección

    // --- 2. EFECTO DE CARGA INICIAL ---
    useEffect(() => {
        // Al montar, llamamos a la función con initialLoad=true
        fetchAndSetWorkspaces(true);
    }, [fetchAndSetWorkspaces]); 

    
    // ... (filteredWorkspaces useMemo sin cambios)
    const filteredWorkspaces = useMemo(() => {
        if (!searchTerm) {
            return workspaces;
        }
        const lowerCaseSearch = searchTerm.toLowerCase();
        return workspaces.filter(ws =>
            ws.name.toLowerCase().includes(lowerCaseSearch) ||
            ws.description.toLowerCase().includes(lowerCaseSearch)
        );
    }, [workspaces, searchTerm]);
    
    // --- 3. GESTIÓN DE DATOS EXTRA (RACKS) AL SELECCIONAR UN WORKSPACE (Sin cambios) ---
    useEffect(() => {
        if (activeWorkspace) {
            const fetchExtraData = async () => {
                setRacksLoading(true);
                setRacksError(null);

                try {
                    const racks = await getAllRacks();
                    setTotalRacks(racks.length);
                } catch (err) {
                    console.error("Error al obtener total de racks:", err);
                    setRacksError('Error');
                } finally {
                    setRacksLoading(false);
                }
            };
            fetchExtraData();
        } else {
            setTotalRacks(null);
            setRacksError(null);
        }
    }, [activeWorkspace]);

    // --- 4. CREACIÓN DEL SCHEMA PARA EL DETAIL VIEWERCARD (Sin cambios) ---
    const detailsSchema = useMemo(() => {
        if (!activeWorkspace) {
            return null;
        }
        return createWorkspaceSchema(
            activeWorkspace,
            totalRacks,
            racksLoading,
            racksError
        );
    }, [activeWorkspace, totalRacks, racksLoading, racksError]);

    // Definición de las columnas para el componente DataTable
    // NOTA: Cambiado item.id a item.name para TableActions (coherente con el resto de la página)
    const columns = useMemo(() => [
        {
            header: 'Nombre del Workspace',
            key: 'name',
            sortable: true,
            render: (item) => (
                <div
                    className={`${styles.nameCellLink} ${item.name === activeWorkspace?.name ? styles.activeName : ''}`}
                    onClick={() => handleTableAction('view', item.name)}>
                    {item.name}
                </div>
            )
        },
        {
            header: 'Red',
            key: 'network',
            sortable: true,
            render: (item) => (
                <span className={styles.networkCell}>
                    <Globe size={14} style={{ marginRight: '6px' }} />
                    {item.network}
                </span>
            )
        },
        {
            header: 'Acciones',
            key: 'actions',
            className: styles.centerAlign,
            render: (item) => (
                <TableActions
                    itemId={item.name} // Usamos name como ID temporal para las acciones
                    onViewDetails={(name) => handleTableAction('view', name)}
                    onEdit={(name) => handleTableAction('edit', name)}
                    onDelete={(name) => handleTableAction('delete', name)}
                />
            )
        },
    ], [activeWorkspace]); 

    // Contenido condicional para la lista/tabla
    const listContent = useMemo(() => {
        if (loading) {
            return (
                <div className={styles.loadingState}>
                    <Loader2 size={36} className="animate-spin" />
                    <p>Cargando Workspaces...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className={styles.emptyState}>
                    <AlertTriangle size={48} className={styles.errorIcon} />
                    <p>Ocurrió un error al cargar los datos.</p>
                    <p className={styles.errorText}>{error}</p>
                    <Button variant="secondary" onClick={() => fetchAndSetWorkspaces(true)}>Reintentar Carga</Button>
                </div>
            );
        }

        if (filteredWorkspaces.length === 0 && searchTerm) {
            return (
                <div className={styles.emptyState}>
                    <AlertTriangle size={48} className={styles.emptyIcon} />
                    <p>No se encontraron Workspaces que coincidan con "{searchTerm}".</p>
                </div>
            );
        }

        if (filteredWorkspaces.length === 0 && !searchTerm) {
            return (
                <div className={styles.emptyState}>
                    <AlertTriangle size={48} className={styles.emptyIcon} />
                    <p>No tienes Workspaces activos. ¡Crea el primero para empezar!</p>
                </div>
            );
        }

        return (
            <DataTable
                data={filteredWorkspaces}
                columns={columns}
                initialSortBy="name"
                initialSortDirection="asc"
            />
        );
    }, [loading, error, filteredWorkspaces, searchTerm, columns, fetchAndSetWorkspaces]); // Usar fetchAndSetWorkspaces

    // Other handlers
    const handleTableAction = (action, name) => {
        const workspace = workspaces.find(ws => ws.name === name);
        if (!workspace) return;

        if (action === 'delete') {
            handleDeleteWorkspace(workspace);
        } else if (action === 'view') {
            setActiveWorkspace(workspace);
            showToast(`Visualizando detalles de ${workspace.name}.`, 'info');
        } else if (action === 'edit') {
            showToast(`Simulando la edición para Workspace: ${workspace.name}`, 'info');
        }
    };

    const handleDeleteWorkspace = (workspace) => {
        setWorkspaceToDelete(workspace);
        setIsDeleteModalOpen(true);
    };

    const handleCloseNewWorkspaceModal = (creationSuccessful = false) => {
        setIsCreateModalOpen(false);
        if (creationSuccessful) {
            // Llama a la función central para recargar la lista
            fetchAndSetWorkspaces();
        }
    };

    const handleConfirmDelete = () => {
        if (!workspaceToDelete) return;

        // Lógica de eliminación en el frontend (idealmente, esto debería ser una llamada a la API)
        const updatedWorkspaces = workspaces.filter(ws => ws.name !== workspaceToDelete.name);
        setWorkspaces(updatedWorkspaces);

        // Si eliminamos el workspace activo, seleccionamos el primero restante
        if (activeWorkspace?.name === workspaceToDelete.name) {
            setActiveWorkspace(updatedWorkspaces[0] || null);
        }

        showToast(`Workspace "${workspaceToDelete.name}" eliminado.`, 'error');
        setIsDeleteModalOpen(false);
        setWorkspaceToDelete(null);
    };

    const handleFilterClick = () => {
        showToast('Abriendo opciones avanzadas de filtro.', 'info');
    };

    return (
        <div>
            <div className={styles.header}>
                <h1>Workspaces</h1>
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
                            <h3>
                                {loading ? 'Cargando lista inicial...' : 'Selecciona un Workspace'}
                            </h3>
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
                            searchPlaceholder="Buscar por nombre, dueño, ID o descripción..."
                        />
                    )}

                    <div className={styles.tableContainer}>
                        {listContent}
                    </div>

                    <div className={styles.listColumnFooter}>
                        <Button
                            variant="primary"
                            onClick={() => setIsCreateModalOpen(true)}
                        >
                            <Plus size={20} style={{ marginRight: '5px' }} />
                            Crear Workspace
                        </Button>
                    </div>
                </div>
            </div>

            {/* Dialogos (Creación y Eliminación) - sin cambios */}
            <Dialog
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            >
                <NewWorkspaceForm
                    onClose={handleCloseNewWorkspaceModal}
                />
            </Dialog>

            <Dialog
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
            >
                <div className={styles.dialogContent}>
                    <header className={`${styles.dialogHeader} ${styles.dialogDanger}`}>
                        <AlertTriangle size={24} style={{ marginRight: '10px' }} />
                        <h2 className={styles.dialogTitle}>Confirmar Eliminación: {workspaceToDelete?.name}</h2>
                    </header>

                    <div className={styles.dialogBody}>
                        <p className={styles.dialogWarningText}>
                            Estás a punto de eliminar el workspace <strong>{workspaceToDelete?.name}</strong>.
                            Esta acción es irreversible y toda la información asociada se perderá.
                            ¿Estás seguro de continuar?
                        </p>
                    </div>

                    <footer className={styles.dialogFooter}>
                        <Button
                            variant="secondary"
                            onClick={() => setIsDeleteModalOpen(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleConfirmDelete}
                        >
                            <Trash2 size={18} />
                            Eliminar Permanentemente
                        </Button>
                    </footer>
                </div>
            </Dialog>
        </div>
    );
};

export default WorkspacesPage;