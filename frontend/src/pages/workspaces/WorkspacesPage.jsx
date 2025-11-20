import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Trash2, AlertTriangle, Loader2, Globe, Plus } from 'lucide-react';
import { useToast } from '../../components/ui/toasts/ToastProvider.jsx';
import DataTable from '../../components/ui/table/DataTable.jsx';
import TableActions from '../../components/ui/table/TableActions.jsx';
import Dialog from '../../components/ui/dialog/Dialog.jsx';
import Input from '../../components/ui/input/InputField.jsx';
import Button from '../../components/ui/button/Button.jsx';
import styles from './WorkspacesPage.module.css';
import SearchFilterBar from '../../components/ui/searchbar/SearchFilterBar.jsx';
import DetailViewerCard from '../../components/ui/detailViewer/DetailViewerCard.jsx';
import NewWorkspaceForm from '../../components/form/workspace/NewWorkspaceForm.jsx';

// API Services
import { getAllWorkspaces } from '../../api/services/workspaceService.js';

const WorkspacesPage = () => {

    const { showToast } = useToast();
    const [workspaces, setWorkspaces] = useState([]);

    const [activeWorkspace, setActiveWorkspace] = useState(null);

    // Estado para el dialog de creación
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Estado para el dialog de eliminación
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [workspaceToDelete, setWorkspaceToDelete] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');

    const handleCloseNewWorkspaceModal = (creationSuccessful = false) => {
        setIsCreateModalOpen(false);
        if (creationSuccessful) {
            // NewWorkspaceForm ya muestra su propio toast de éxito tras la simulación de envío,
            // pero si tuviéramos que añadir los datos del servidor a la lista padre, 
            // la lógica iría aquí. Por ahora, solo cerramos el modal.
            fetchWorkspaces();
        }
    };

    const fetchWorkspaces = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Llama a la función de API (que usa apiClient.get('/components'))
            const data = await getAllWorkspaces();
            setWorkspaces(data);
            if (data.length > 0 && !activeWorkspace) {
                // Selecciona el primer workspace como activo por defecto si no hay ninguno
                setActiveWorkspace(data[0]);
            }
        } catch (err) {
            console.error('Error al cargar los worspaces:', err);
            setError('Error al obtener los workspaces. Asegúrate de que el backend esté funcionando.');
            showToast('Error de conexión con el servidor.', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast, activeWorkspace]);

    // 2. EFECTO PARA CARGAR DATOS AL MONTAR
    useEffect(() => {
        fetchWorkspaces();
    }, [fetchWorkspaces]);

    const filteredWorkspaces = useMemo(() => {
        if (!searchTerm) {
            return workspaces;
        }
        const lowerCaseSearch = searchTerm.toLowerCase();
        return workspaces.filter(ws =>
            ws.name.toLowerCase().includes(lowerCaseSearch) ||
            ws.owner.toLowerCase().includes(lowerCaseSearch) ||
            ws.description.toLowerCase().includes(lowerCaseSearch) ||
            ws.id.toLowerCase().includes(lowerCaseSearch)
        );
    }, [workspaces, searchTerm]);

    // Abre el Dialog de confirmación
    const handleDeleteWorkspace = (workspace) => {
        setWorkspaceToDelete(workspace);
        setIsDeleteModalOpen(true);
    };

    // Finaliza la eliminación después de la confirmación del Dialog
    const handleConfirmDelete = () => {
        if (!workspaceToDelete) return;

        setWorkspaces(prev => prev.filter(ws => ws.id !== workspaceToDelete.id));

        // Si eliminamos el workspace activo, seleccionamos el primero restante
        if (activeWorkspace?.name === workspaceToDelete.name) {
            setActiveWorkspace(workspaces.filter(ws => ws.name !== workspaceToDelete.name)[0] || null);
        }

        showToast(`Workspace "${workspaceToDelete.name}" eliminado.`, 'error');

        // Cierra el dialog y limpia el estado
        setIsDeleteModalOpen(false);
        setWorkspaceToDelete(null);
    };


    const handleTableAction = (action, id) => {
        const workspace = workspaces.find(ws => ws.id === id);
        if (!workspace) return;

        if (action === 'delete') {
            handleDeleteWorkspace(workspace);
        } else if (action === 'view') {
            // 3. ✨ Actualizamos el estado del visor en lugar de navegar
            setActiveWorkspace(workspace);
            showToast(`Visualizando detalles de ${workspace.name}.`, 'info');
        } else if (action === 'edit') {
            showToast(`Simulando la edición para Workspace: ${workspace.name}`, 'info');
        }
    };

    const handleFilterClick = () => {
        showToast('Abriendo opciones avanzadas de filtro.', 'info');
    };

    // Definición de las columnas para el componente DataTable
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
                    itemId={item.id}
                    onViewDetails={(id) => handleTableAction('view', id)}
                    onEdit={(id) => handleTableAction('edit', id)}
                    onDelete={(id) => handleTableAction('delete', id)}
                />
            )
        },
    ], [activeWorkspace, workspaces]); // La dependencia 'workspaces' no es necesaria si solo definimos columnas

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
                    <Button variant="secondary" onClick={fetchWorkspaces}>Reintentar Carga</Button>
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
    }, [loading, error, filteredWorkspaces, searchTerm, columns, fetchWorkspaces]);

    return (
        <div>
            {/* Título y Barra de Acciones */}
            <div className={styles.header}>
                <h1>
                    Workspaces
                </h1>
            </div>

            <div className={styles.contentGrid}>
                {/* Columna de Visualización / Detalles */}
                <div className={styles.visualizerColumn}>
                    <DetailViewerCard
                        item={activeWorkspace} // ⬅️ Le pasamos el servidor activo
                    />
                </div>

                {/* Implementación de la cuadrícula de dos columnas */}
                <div className={styles.listColumn}>

                    {/* Barra de Búsqueda y Filtros solo se muestra si NO está cargando o en error */}
                    {!loading && !error && (
                        <SearchFilterBar
                            onSearchChange={setSearchTerm}
                            onFilterClick={handleFilterClick}
                            searchPlaceholder="Buscar por nombre, dueño, ID o descripción..."
                        />
                    )}

                    {/* Contenedor de la Tabla/Contenido Condicional */}
                    <div className={styles.tableContainer}>
                        {listContent}
                    </div>

                    {/* Contenedor de la Tabla/Contenido Condicional */}
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

            {/* Dialogo de Creación de Workspace */}
            <Dialog
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            >
                <NewWorkspaceForm
                    onClose={handleCloseNewWorkspaceModal}
                />
            </Dialog>

            {/* Dialogo de Confirmación de Eliminación */}
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