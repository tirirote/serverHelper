import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom'; // 🚨 Nuevo Import
import { PlusCircle, Trash2, AlertTriangle, Save } from 'lucide-react';
import { useToast } from '../../components/ui/toasts/ToastProvider.jsx';
import DataTable from '../../components/ui/table/DataTable.jsx'; // 🚨 Ruta estandarizada
import TableActions from '../../components/ui/table/TableActions.jsx'; // 🚨 Componente de Acciones de Tabla
import Dialog from '../../components/ui/dialog/Dialog.jsx'; // Componente de Dialog
import Input from '../../components/ui/input/InputField.jsx'; // Componente de Input estandarizado
import Button from '../../components/ui/button/Button.jsx'; // Componente de Botón estandarizado
import styles from './WorkspacesPage.module.css';
import SearchFilterBar from '../../components/ui/searchbar/SearchFilterBar.jsx';
// Datos de ejemplo
const initialWorkspaces = [
    {
        id: 'ws-1', name: 'Project Chimera', status: 'Active', members: 4, lastUpdated: 'Hace 2 horas', owner: 'Alice',
        description: 'Entorno para el desarrollo principal de la API.', network: 'Default-VPC',
    },
    {
        id: 'ws-2', name: 'Server Deployment V2', status: 'Pending', members: 1, lastUpdated: 'Hace 1 día', owner: 'Bob',
        description: 'Configuración y pruebas de la infraestructura del nuevo servidor.', network: 'Staging-Net',
    },
    {
        id: 'ws-3', name: 'Marketing Campaign 2024', status: 'Archived', members: 7, lastUpdated: 'Hace 1 semana', owner: 'Charlie',
        description: 'Espacio histórico de la campaña Q1.', network: 'External-Access',
    },
    {
        id: 'ws-4', name: 'Infraestructura Dev', status: 'Active', members: 2, lastUpdated: 'Hace 5 horas', owner: 'Alice',
        description: 'Sandbox para pruebas rápidas de infraestructura.', network: 'Default-VPC',
    },
    {
        id: 'ws-5', name: 'Documentación API', status: 'Pending', members: 3, lastUpdated: 'Hace 2 días', owner: 'Eve',
        description: 'Borradores de la documentación técnica de la V3.', network: 'Docs-Net',
    },
];

const WorkspacesPage = () => {
    const navigate = useNavigate(); // 🚨 Hook de navegación

    const { showToast } = useToast();
    const [workspaces, setWorkspaces] = useState(initialWorkspaces);

    // Estado para el dialog de creación
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newWorkspaceName, setNewWorkspaceName] = useState('');

    // Estado para el dialog de eliminación
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [workspaceToDelete, setWorkspaceToDelete] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');

    const filteredWorkspaces = useMemo(() => {
        if (!searchTerm) {
            return workspaces;
        }
        const lowerCaseSearch = searchTerm.toLowerCase();
        return workspaces.filter(ws =>
            ws.name.toLowerCase().includes(lowerCaseSearch) ||
            ws.owner.toLowerCase().includes(lowerCaseSearch) ||
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
            status: 'Active',
            members: 1,
            lastUpdated: 'Justo ahora',
            owner: 'Tú',
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
            // Navega a la ruta de detalle: /workspaces/ws-1
            navigate(`/workspaces/${id}`);
        } else if (action === 'edit') {
            // Si la acción es 'edit', por ahora solo mostramos un toast
             showToast(`Simulando la edición para Workspace: ${workspace.name}`, 'info');
        }
    };

    const handleFilterClick = () => {
        showToast('Abriendo opciones avanzadas de filtro.', 'info');
    };

    // Definición de las columnas para el componente DataTable
    const columns = useMemo(() => [
        {
            header: 'ID',
            key: 'id',
            render: (item) => <span style={{ fontWeight: 'bold' }}>{item.id}</span>
        },
        {
            header: 'Nombre del Workspace',
            key: 'name',
            render: (item) => (
                <div className={styles.nameCell} onClick={() => handleTableAction('view', item.id)}>
                    {item.name}
                </div>
            )
        },
        {
            header: 'Descripción',
            key: 'description',
            render: (item) => (
                <span className={styles.descriptionCell} title={item.description}>
                    {item.description}
                </span>
            )
        },
        {
            header: 'Red',
            key: 'network',
            render: (item) => (
                <span className={styles.networkCell}>
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
                    onDelete={(id) => handleTableAction('delete', id)}
                />
            )
        },
    ], [workspaces]);

    return (
        <div className={styles.workspacesPage}>
            <header>
                <h1>
                    Mis Workspaces
                </h1>
            </header>

            <div className={styles.headerContainer}>
                <SearchFilterBar
                    onSearchChange={setSearchTerm}
                    onFilterClick={handleFilterClick}
                    searchPlaceholder="Buscar por nombre, dueño o ID..."
                />
                <Button
                    variant="primary"
                    onClick={() => setIsCreateModalOpen(true)}
                >
                    <PlusCircle size={20} />
                    Crear Workspace
                </Button>
            </div>
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
                        data={filteredWorkspaces} // 🚨 Usamos la data filtrada
                        columns={columns}
                        initialSortBy="name"
                    />
                </div>
            )}

            {/* Dialogo de Creación de Workspace */}
            <Dialog
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            >
                {/* Usamos un formulario nativo para el submit */}
                <form onSubmit={handleCreateWorkspace} className={styles.dialogForm}>
                    <header className={styles.dialogHeader}>
                        <h2 className={styles.dialogTitle}>Crear Nuevo Workspace</h2>
                    </header>

                    <div className={styles.dialogBody}>
                        <Input
                            id="workspaceName"
                            label="Nombre del Workspace"
                            type="text"
                            value={newWorkspaceName}
                            onChange={(e) => setNewWorkspaceName(e.target.value)}
                            placeholder="Ej: Proyecto Server v3.0"
                            required
                        />
                    </div>

                    <footer className={styles.dialogFooter}>
                        <Button
                            variant="secondary"
                            onClick={() => setIsCreateModalOpen(false)}
                            type="button"
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="primary"
                            type="submit"
                        >
                            <Save size={18} />
                            Crear
                        </Button>
                    </footer>
                </form>
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
                        <p>
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