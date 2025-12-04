import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Trash2, AlertTriangle, Loader2, Globe, Plus, Info, RefreshCcw } from 'lucide-react';
import { useToast } from '../../../components/ui/toasts/ToastProvider.jsx';
import DataTable from '../../../components/ui/table/DataTable.jsx';
import TableActions from '../../../components/ui/table/TableActions.jsx';
import Dialog from '../../../components/ui/dialog/Dialog.jsx';
import Button from '../../../components/ui/button/Button.jsx';
import styles from '../Tab.module.css';
import SearchFilterBar from '../../../components/ui/searchbar/SearchFilterBar.jsx';
import NewWorkspaceForm from '../../../components/form/workspace/NewWorkspaceForm.jsx';
// API Services
import { getAllWorkspaces, createWorkspace, deleteWorkspace } from '../../../api/services/workspaceService.js';
import { getAllRacks } from '../../../api/services/rackService.js';


const WorkspacesTab = ({ onSelectItem }) => {
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

    const activeWorkspaceRef = useRef(activeWorkspace);

    const fetchAndSetWorkspaces = useCallback(async (initialLoad = false) => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAllWorkspaces();
            setWorkspaces(data || []);
            const currentActive = activeWorkspaceRef.current;
            if (data.length > 0 && (initialLoad || !currentActive)) {
                setActiveWorkspace(data[0]);
                if (onSelectItem) onSelectItem({ ...data[0], type: 'workspace' });
            }
        } catch (err) {
            console.error('Error al cargar los workspaces:', err);
            setError('Error al obtener los workspaces.');
            showToast('Error de conexión con el servidor.', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast, onSelectItem]);

    useEffect(() => { activeWorkspaceRef.current = activeWorkspace; }, [activeWorkspace]);

    useEffect(() => { fetchAndSetWorkspaces(true); }, [fetchAndSetWorkspaces]);

    useEffect(() => {
        if (activeWorkspace) {
            const fetchExtraData = async () => {
                setRacksLoading(true);
                setRacksError(null);
                try {
                    const racks = await getAllRacks();
                    setTotalRacks(racks.length);
                } catch (err) {
                    console.error('Error al obtener total de racks:', err);
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

    const filteredWorkspaces = useMemo(() => {
        if (!searchTerm) return workspaces;
        const lower = searchTerm.toLowerCase();
        return workspaces.filter(ws => (ws.name || '').toLowerCase().includes(lower) || (ws.description || '').toLowerCase().includes(lower));
    }, [workspaces, searchTerm]);

    const columns = useMemo(() => [
        {
            header: 'Nombre del Workspace', key: 'name', sortable: true, render: item => (
                <div className={`${styles.nameCellLink} ${item.name === activeWorkspace?.name ? styles.activeName : ''}`} onClick={() => { setActiveWorkspace(item); if (onSelectItem) onSelectItem({ ...item, type: 'workspace' }); }}>{item.name}</div>
            )
        },
        { header: 'Red', key: 'network', sortable: true, render: item => <span className={styles.networkCell}>{item.network}</span> },
        {
            header: 'Acciones', key: 'actions', className: styles.centerAlign, render: item => (
                <TableActions itemId={item.name} onViewDetails={() => { setActiveWorkspace(item); if (onSelectItem) onSelectItem({ ...item, type: 'workspace' }); }} onEdit={() => showToast('Editar workspace - pendiente implementation', 'info')} onDelete={() => { setWorkspaceToDelete(item); setIsDeleteModalOpen(true); }} />
            )
        }
    ], [activeWorkspace, onSelectItem, showToast]);

    const handleCreateWorkspace = async (workspaceData) => {
        try {
            await createWorkspace(workspaceData);
            showToast(`Workspace "${workspaceData.name}" creado.`, 'success');
            await fetchAndSetWorkspaces();
            setIsCreateModalOpen(false);
        } catch (err) {
            console.error('Error al crear workspace:', err);
            showToast('Error creando workspace', 'error');
            throw err;
        }
    };

    const handleConfirmDelete = async () => {
        if (!workspaceToDelete) return;
        try {
            await deleteWorkspace(workspaceToDelete.name);
            showToast(`Workspace "${workspaceToDelete.name}" eliminado.`, 'success');
            setIsDeleteModalOpen(false);
            setWorkspaceToDelete(null);
            await fetchAndSetWorkspaces();
        } catch (err) {
            console.error('Error al eliminar workspace:', err);
            showToast('Error eliminando workspace', 'error');
            throw err;
        }
    };

    return (
        <div>
            <div className={styles.headerButtons}>
                <div className={styles.searchContainer}></div>
                <div className={styles.buttonGroup}>
                    <Button variant='icon-only' onClick={() => fetchAndSetWorkspaces()}><RefreshCcw size={20}/></Button>
                    <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}><Plus size={16} /> Crear Workspace</Button>
                </div>
            </div>

            <SearchFilterBar onSearchChange={setSearchTerm} />

            <div>
                {loading ? (
                    <div className={styles.emptyState}><Loader2 size={36} className="animate-spin" /><p>Cargando Workspaces...</p></div>
                ) : error ? (
                    <div className={styles.emptyState}><AlertTriangle size={48} className={styles.errorIcon} /><p>{error}</p></div>
                ) : (
                    <DataTable data={filteredWorkspaces} columns={columns} initialSortBy="name" initialSortDirection="asc" />
                )}
            </div>

            <Dialog isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
                <NewWorkspaceForm onClose={() => setIsCreateModalOpen(false)} onSubmit={handleCreateWorkspace} />
            </Dialog>

            <Dialog isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
                <div className={styles.dialogContent}>
                    <div className={styles.dialogHeader}>
                        <h2>Vas a eliminar: {workspaceToDelete?.name}</h2>
                    </div>
                    <div className={styles.dialogBody}>
                        <p>
                            Estás a punto de eliminar el workspace <strong>{workspaceToDelete?.name}</strong>.
                            Esta acción es irreversible y toda la información asociada se perderá.
                            ¿Estás seguro de continuar?
                        </p>
                        <Button variant="danger" onClick={handleConfirmDelete}><Trash2 size={20} /> Eliminar</Button>
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default WorkspacesTab;
