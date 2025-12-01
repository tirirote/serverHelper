import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Trash2, AlertTriangle, Loader2, Globe, Plus, CircleQuestionMark, Info } from 'lucide-react';
import { useToast } from '../../components/ui/toasts/ToastProvider.jsx';
import DataTable from '../../components/ui/table/DataTable.jsx';
import TableActions from '../../components/ui/table/TableActions.jsx';
import Dialog from '../../components/ui/dialog/Dialog.jsx';
import Button from '../../components/ui/button/Button.jsx';
import styles from '../Page.module.css';
import SearchFilterBar from '../../components/ui/searchbar/SearchFilterBar.jsx';
import DetailViewerCard from '../../components/ui/detailViewer/DetailViewerCard.jsx';
import GenericSelector from '../../components/ui/selector/GenericSelector.jsx';
import NewWorkspaceForm from '../../components/form/workspace/NewWorkspaceForm.jsx';
import NewRackForm from '../../components/form/rack/NewRackForm.jsx';
// API Services
import { getAllWorkspaces, createWorkspace } from '../../api/services/workspaceService.js';
import { getAllRacks, createRack, deleteRack } from '../../api/services/rackService.js';


// Mantenemos esta función de pre-procesamiento fuera del componente para que no se redefina.
const createWorkspaceSchema = (workspaceItem, totalRacks, racksLoading, racksError) => {
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

const createRackSchema = (rackItem, workspaceItem, totalServers, serversLoading, serversError) => {
    const serverValue = serversLoading
        ? 'Cargando...'
        : serversError
            ? 'N/A (Error de API)'
            : totalServers;

    const details = [
        { label: 'Nombre', value: rackItem.name },
        { label: 'Unidades', value: rackItem.units },
        { label: 'Servidores Totales', value: serverValue },
        { label: 'Coste Total', value: rackItem.totalCost },
        { label: 'Mantenimiento', value: rackItem.totalMaintenanceCost },
        { label: 'Worksapce', value: rackItem.workspaceName },
        { label: 'Salud', value: rackItem.healthStatus },
        { label: 'Estado', value: rackItem.powerStatus },

    ];

    return {
        name: rackItem.name,
        description: rackItem.description,
        modelPath: rackItem.modelPath,
        type: 'rack',
        details: details,
        compatibilityItems: rackItem.servers || [],
    };
};

const MyRacksPage = () => {
    // navigate previously used to go to workspace details — not needed here
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
    // Racks & selection state for the active workspace
    const [racks, setRacks] = useState([]);
    const [racksLoading, setRacksLoading] = useState(false);
    const [racksError, setRacksError] = useState(null);
    const [selectedRack, setSelectedRack] = useState(null);
    const [isCreateRackModalOpen, setIsCreateRackModalOpen] = useState(false);

    // --- 1. FUNCIÓN CENTRAL DE FETCH (Reemplaza fetchInitialData y refetchWorkspaces) ---
    const activeWorkspaceRef = useRef(activeWorkspace);

    const fetchAndSetWorkspaces = useCallback(async (initialLoad = false) => {
        setLoading(true);
        setError(null);

        try {
            const data = await getAllWorkspaces();
            setWorkspaces(data);

            // Solo seleccionamos el primer workspace si es la carga inicial
            // o si el workspace activo fue eliminado.
            const currentActive = activeWorkspaceRef.current;
            // Do not auto-select a workspace — selection should be explicit by the user
            // (keeps the page focused on choosing first the workspace to work in).
            if (initialLoad && !currentActive) {
                // leave activeWorkspace null by default
            }
        } catch (err) {
            console.error('Error al cargar los workspaces:', err);
            setError('Error al obtener los workspaces. Asegúrate de que el backend esté funcionando.');
            showToast('Error de conexión con el servidor.', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]); // don't include activeWorkspace to avoid refetch loop

    // keep ref in sync
    useEffect(() => { activeWorkspaceRef.current = activeWorkspace; }, [activeWorkspace]);

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
        // Whenever the active workspace changes we fetch the racks for that workspace
        setSelectedRack(null);
        setRacks([]);
        if (activeWorkspace) {
            const fetchExtraData = async () => {
                setRacksLoading(true);
                setRacksError(null);
                try {
                    const list = await getAllRacks(activeWorkspace.name);
                    setRacks(list || []);
                    // auto select first rack when available
                    if (list && list.length > 0) setSelectedRack(list[0]);
                } catch (err) {
                    console.error("Error al obtener racks para workspace:", err);
                    setRacksError('Error');
                } finally {
                    setRacksLoading(false);
                }
            };
            fetchExtraData();
        } else {
            setRacks([]);
            setRacksError(null);
        }
    }, [activeWorkspace]);

    // --- 4. CREACIÓN DEL SCHEMA PARA EL DETAIL VIEWERCARD (Sin cambios) ---
    // detailsSchema now prefers selectedRack details if present; otherwise shows workspace info
    const detailsSchema = useMemo(() => {
        if (selectedRack) {
            return createRackSchema(selectedRack, selectedRack.servers, racksLoading, racksError);
        }

        if (!activeWorkspace) return null;
        // fallback to workspace view
        return createWorkspaceSchema(activeWorkspace, racks.length, racksLoading, racksError);
    }, [activeWorkspace, selectedRack, racks, racksLoading, racksError]);

    // Definición de las columnas para el componente DataTable
    // NOTA: Cambiado item.id a item.name para TableActions (coherente con el resto de la página)
    // Columns for the table when listing workspaces
    const workspaceColumns = useMemo(() => [
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

    // When activeWorkspace is selected we list racks; columns for that table
    const rackColumns = useMemo(() => [
        {
            header: 'Rack', key: 'name', sortable: true, render: (item) => (
                <div className={`${styles.nameCellLink} ${item.name === selectedRack?.name ? styles.activeName : ''}`}
                    onClick={() => { setSelectedRack(item); showToast(`Seleccionado rack ${item.name}`, 'info'); }}>
                    {item.name}
                </div>
            )
        },
        { header: 'Unidades', key: 'units', sortable: true, render: (item) => item.units || '—' },
        { header: 'Estado', key: 'healthStatus', render: (item) => item.healthStatus || '—' },
        {
            header: 'Acciones', key: 'actions', className: styles.centerAlign, render: (item) => (
                <TableActions
                    itemId={item.name}
                    onViewDetails={() => setSelectedRack(item)}
                    onDelete={() => {
                        // simple delete flow: call API and reload racks
                        if (!activeWorkspace) return;
                        const confirmDelete = window.confirm(`¿Eliminar rack ${item.name}?`);
                        if (!confirmDelete) return;
                        deleteRack(activeWorkspace.name, item.name).then(async () => {
                            showToast(`Rack ${item.name} eliminado`, 'success');
                            const newList = await getAllRacks(activeWorkspace.name);
                            setRacks(newList || []);
                            setSelectedRack(newList && newList.length ? newList[0] : null);
                        }).catch(err => {
                            console.error('Error deleting rack', err);
                            showToast('Error al eliminar rack', 'error');
                        });
                    }} />
            )
        }
    ], [selectedRack, activeWorkspace]);


    const handleFilterClick = () => {
        showToast('Abriendo opciones avanzadas de filtro.', 'info');
    };

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

        // If a workspace is selected show racks table instead
        if (activeWorkspace) {
            if (racksLoading) return (
                <div className={styles.loadingState}><Loader2 size={36} className="animate-spin" /><p>Cargando racks...</p></div>
            );
            if (racksError) return (<div className={styles.emptyState}><AlertTriangle size={48} />Error al cargar racks</div>);

            return (
                <div>
                    <SearchFilterBar
                        onSearchChange={setSearchTerm}
                        onFilterClick={handleFilterClick}
                        searchPlaceholder="Buscar por nombre, dueño, ID o descripción..."
                    />
                    <DataTable
                        data={racks}
                        columns={rackColumns}
                        initialSortBy="name"
                        initialSortDirection="asc"
                    />
                </div>

            );
        }

        return (
            <></>
        );
    }, [loading, error, filteredWorkspaces, searchTerm, workspaceColumns, rackColumns, fetchAndSetWorkspaces, activeWorkspace, racks, racksLoading, racksError]); // Usar fetchAndSetWorkspaces

    // Other handlers
    const handleTableAction = (action, name) => {
        const workspace = workspaces.find(ws => ws.name === name);
        if (!workspace) return;

        if (action === 'delete') {
            handleDeleteWorkspace(workspace);
        } else if (action === 'view') {
            // Select workspace to work with — do not navigate away
            setActiveWorkspace(workspace);
            showToast(`Workspace seleccionado: ${workspace.name}`, 'info');
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

    const handleCreateWorkspace = async (workspaceData) => {
        try {
            await createWorkspace(workspaceData);
            showToast(`Workspace "${workspaceData.name}" creado.`, 'success');
            await fetchAndSetWorkspaces();
            setIsCreateModalOpen(false);
        } catch (err) {
            console.error('Error al crear workspace:', err);
            throw err; // let the form display the error with toasts
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


    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1>My Racks</h1>
                <Button
                    variant="primary"
                    onClick={() => showToast('Selecciona un workspace para gestionar racks y servidores dentro de él.', 'info')}
                > <Info size={20} />
                </Button>
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
                                {loading ? 'Cargando lista inicial...' : (activeWorkspace ? 'Selecciona un Rack' : 'Busca un workspace')}
                            </h3>
                            <p>Busca y Selecciona una workspace para comenzar a trabajar.</p>
                        </div>
                    )}
                </div>

                {/* Columna de Lista */}
                <div className={styles.listColumn}>
                    {!loading && !error && (
                        <>
                            {/* Workspace picker - single selection */}
                            <GenericSelector
                                availableItems={workspaces}
                                compatibleItems={activeWorkspace ? [activeWorkspace] : []}
                                onAddComponent={(ws) => {
                                    // set the chosen workspace as active
                                    setActiveWorkspace(ws);
                                    showToast(`Workspace seleccionado: ${ws.name}`, 'info');
                                }}
                                onRemoveComponent={() => {
                                    setActiveWorkspace(null);
                                    setSelectedRack(null);
                                    showToast('Workspace deseleccionado', 'info');
                                }}
                                isLoading={loading}
                                selectorTitle="Selecciona el Workspace para trabajar"
                                listTitle="Workspace activo"
                                singleSelection={true}
                            />


                        </>
                    )}

                    <div className={styles.tableContainer}>
                        {listContent}
                    </div>

                    <div className={styles.listColumnFooter}>
                        {/* When a workspace is active show rack creation button */}
                        {activeWorkspace ? (
                            <div style={{ display: 'flex', gap: 10 }}>
                                <Button variant="primary" onClick={() => setIsCreateRackModalOpen(true)}>
                                    <Plus size={20} style={{ marginRight: '5px' }} />
                                    Crear Rack en {activeWorkspace.name}
                                </Button>
                            </div>
                        ) : (
                            <Button
                                variant="primary"
                                onClick={() => setIsCreateModalOpen(true)}
                            >
                                <Plus size={20} style={{ marginRight: '5px' }} />
                                Crear Workspace
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Dialogos (Creación y Eliminación) - sin cambios */}
            {/* Create Rack dialog (only shown when a workspace is selected) */}
            <Dialog
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            >
                <NewWorkspaceForm
                    onClose={handleCloseNewWorkspaceModal}
                    onSubmit={handleCreateWorkspace}
                />
            </Dialog>

            <Dialog
                isOpen={isCreateRackModalOpen}
                onClose={() => setIsCreateRackModalOpen(false)}>
                <NewRackForm
                    onClose={() => setIsCreateRackModalOpen(false)}
                    onSubmit={async (rackData) => {
                        if (!activeWorkspace) {
                            showToast('Selecciona primero un Workspace', 'error');
                            return;
                        }
                        // Ensure rack gets created under the active workspace
                        try {
                            await createRack({ ...rackData, workspaceName: activeWorkspace.name });
                            showToast(`Rack ${rackData.name} creado en ${activeWorkspace.name}`, 'success');
                            // refresh racks
                            const list = await getAllRacks(activeWorkspace.name);
                            setRacks(list || []);
                            setSelectedRack(list && list.length ? list[0] : null);
                        } catch (err) {
                            console.error('Error creating rack', err);
                            showToast('Error creando rack', 'error');
                        }
                    }}
                    workspaces={[activeWorkspace]}
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

export default MyRacksPage;