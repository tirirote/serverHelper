import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Trash2, AlertTriangle, Save, FolderOpen, Zap, Archive, Globe, Plus } from 'lucide-react';
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

// Datos de ejemplo
const initialWorkspaces = [
    {
        id: 'ws-1',
        name: 'Project Chimera',
        description: ' Proyecto Chimera, destinado a la estructura del backend.',
        network: 'Default-VPC'
    }
];


const WorkspacesPage = () => {

    const { showToast } = useToast();
    const [workspaces, setWorkspaces] = useState(initialWorkspaces);
    const [activeWorkspace, setActiveWorkspace] = useState(initialWorkspaces[0] || null);

    // Estado para el dialog de creación
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newWorkspaceName, setNewWorkspaceName] = useState('');

    // Estado para el dialog de eliminación
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [workspaceToDelete, setWorkspaceToDelete] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');

    const handleCloseNewWorkspaceModal = (creationSuccessful = false) => {
        setIsCreateModalOpen(false);
        if (creationSuccessful) {
            // NewWorkspaceForm ya muestra su propio toast de éxito tras la simulación de envío,
            // pero si tuviéramos que añadir los datos del servidor a la lista padre, 
            // la lógica iría aquí. Por ahora, solo cerramos el modal.
        }
    };

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

    // Función simulada para manejar la creación de un nuevo workspace
    const handleCreateWorkspace = (e) => {
        e.preventDefault();
        if (newWorkspaceName.trim() === '') {
            showToast('El nombre del Workspace no puede estar vacío.', 'warning');
            return;
        }

        const newWorkspace = {
            id: `ws-${Date.now()}`,
            name: newWorkspaceName.trim(),
            status: 'Pending', // Nuevo workspace comienza en pending
            members: 1,
            lastUpdated: 'Justo ahora',
            owner: 'Tú',
            description: 'Nueva descripción por defecto.',
            network: 'Temp-Net',
        };

        setWorkspaces(prev => [newWorkspace, ...prev]);
        showToast(`Workspace "${newWorkspace.name}" creado con éxito.`, 'success');

        setNewWorkspaceName('');
        setIsCreateModalOpen(false);
    };

    // Abre el Dialog de confirmación
    const handleDeleteWorkspace = (workspace) => {
        setWorkspaceToDelete(workspace);
        setIsDeleteModalOpen(true);
    };

    // Finaliza la eliminación después de la confirmación del Dialog
    const handleConfirmDelete = () => {
        if (!workspaceToDelete) return;

        setWorkspaces(prev => prev.filter(ws => ws.id !== workspaceToDelete.id));
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
                    className={`${styles.nameCellLink} ${item.id === activeWorkspace?.id ? styles.activeName : ''}`}
                    onClick={() => handleTableAction('view', item.id)}>
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
    ], [workspaces, activeWorkspace]); // La dependencia 'workspaces' no es necesaria si solo definimos columnas

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

                    {/* Barra de Búsqueda y Filtros */}
                    <SearchFilterBar
                        onSearchChange={setSearchTerm}
                        onFilterClick={handleFilterClick}
                        searchPlaceholder="Buscar por nombre, dueño, ID o descripción..."
                    />

                    {/* Contenedor de la Tabla */}
                    <div className={styles.tableContainer}>
                        {filteredWorkspaces.length === 0 && searchTerm ? (
                            <div className={styles.emptyState}>
                                <AlertTriangle size={48} className={styles.emptyIcon} />
                                <p>No se encontraron Workspaces que coincidan con "{searchTerm}".</p>
                            </div>
                        ) : filteredWorkspaces.length === 0 && !searchTerm ? (
                            <div className={styles.emptyState}>
                                <AlertTriangle size={48} className={styles.emptyIcon} />
                                <p>No tienes Workspaces activos. ¡Crea el primero para empezar!</p>
                            </div>
                        ) : (
                            <div className={styles.tableContainer}>
                                <DataTable
                                    data={filteredWorkspaces}
                                    columns={columns}
                                    initialSortBy="name"
                                    initialSortDirection="asc"
                                />
                            </div>
                        )}

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