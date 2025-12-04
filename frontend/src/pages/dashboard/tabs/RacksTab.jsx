import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Trash2, AlertTriangle, Loader2, Plus, RefreshCcw } from 'lucide-react';
import { useToast } from '../../../components/ui/toasts/ToastProvider.jsx';
import DataTable from '../../../components/ui/table/DataTable.jsx';
import TableActions from '../../../components/ui/table/TableActions.jsx';
import Dialog from '../../../components/ui/dialog/Dialog.jsx';
import Button from '../../../components/ui/button/Button.jsx';
import styles from '../Tab.module.css';
import SearchFilterBar from '../../../components/ui/searchbar/SearchFilterBar.jsx';
import GenericSelector from '../../../components/ui/selector/GenericSelector.jsx';
import NewRackForm from '../../../components/form/rack/NewRackForm.jsx';
// API
import { getAllRacks, createRack, deleteRack } from '../../../api/services/rackService.js';
import { getAllWorkspaces } from '../../../api/services/workspaceService.js';

const RacksTab = ({ onSelectItem }) => {
    const { showToast } = useToast();
    const [racks, setRacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [rackToDelete, setRackToDelete] = useState(null);

    const [workspaces, setWorkspaces] = useState([]);
    const [activeWorkspace, setActiveWorkspace] = useState(null);
    const [selectedRack, setSelectedRack] = useState(null);
    // --- 1. FUNCIÓN CENTRAL DE FETCH (Reemplaza fetchInitialData y refetchWorkspaces) ---
    const activeWorkspaceRef = useRef(activeWorkspace);
    const activeRacksRef = useRef(racks);
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

    const fetchAndSetRacks = useCallback(async (initialLoad = false) => {
        setLoading(true);
        setError(null);
        try {
            setSelectedRack(null);
            setRacks([]);
            if (activeWorkspace) {
                const fetchExtraData = async () => {
                    setLoading(true);
                    setError(null);
                    try {
                        const list = await getAllRacks(activeWorkspace.name);
                        setRacks(list || []);
                        const currentActive = activeRacksRef.current;
                        // Do not auto-select a workspace — selection should be explicit by the user
                        // (keeps the page focused on choosing first the workspace to work in).
                        if (initialLoad && !currentActive) {
                            // leave activeWorkspace null by default
                        }
                    } catch (err) {
                        console.error("Error al obtener racks para workspace:", err);
                        setError('Error');
                    } finally {
                        setLoading(false);
                    }
                };
                fetchExtraData();
            } else {
                setRacks([]);
                setError(null);
            }
        } catch (err) {
            console.error('Error al cargar los racks:', err);
            setError('Error al obtener los racks. Asegúrate de que el backend esté funcionando.');
            showToast('Error de conexión con el servidor.', 'error');
        } finally {
            setLoading(false);
        }
    }, [activeWorkspace]);

    // --- 2. EFECTO DE CARGA INICIAL ---
    useEffect(() => {
        // Al montar, llamamos a la función con initialLoad=true
        fetchAndSetWorkspaces(true);
    }, [fetchAndSetWorkspaces]);

    // keep ref in sync
    useEffect(() => { activeWorkspaceRef.current = activeWorkspace; }, [activeWorkspace]);
    // --- 3. GESTIÓN DE DATOS EXTRA (RACKS) AL SELECCIONAR UN WORKSPACE (Sin cambios) ---

    useEffect(() => {
        // Whenever the active workspace changes we fetch the racks for that workspace
        fetchAndSetRacks(true)
    }, [fetchAndSetRacks]);

    const filtered = useMemo(() => {
        if (!searchTerm) return racks;
        const low = searchTerm.toLowerCase();
        return racks.filter(r => (r.name || '').toLowerCase().includes(low) || (r.workspaceName || '').toLowerCase().includes(low));
    }, [racks, searchTerm]);

    const columns = useMemo(() => [
        { header: 'Rack', key: 'name', render: item => <div onClick={() => onSelectItem && onSelectItem({ ...item, type: 'rack' })}>{item.name}</div> },
        { header: 'Workspace', key: 'workspaceName', render: item => item.workspaceName || '—' },
        {
            header: 'Acciones', key: 'actions', className: styles.centerAlign, render: item => (
                <TableActions itemId={item.name} onViewDetails={() => onSelectItem && onSelectItem({ ...item, type: 'rack' })} onEdit={() => showToast('Editar rack - pendiente', 'info')} onDelete={() => { setRackToDelete(item); setIsDeleteModalOpen(true); }} />
            )
        }
    ], [onSelectItem, showToast]);

    const handleCreate = async (data) => {
        try {
            await createRack(data);
            showToast('Rack creado', 'success');
            const list = await getAllRacks(); setRacks(list || []);
            setIsCreateModalOpen(false);
        } catch (err) { console.error(err); showToast('Error creando rack', 'error'); throw err; }
    };

    const handleConfirmDelete = async () => {
        if (!rackToDelete) return;
        try { await deleteRack(rackToDelete.workspaceName, rackToDelete.name); showToast('Rack eliminado', 'success'); setIsDeleteModalOpen(false); const list = await getAllRacks(); setRacks(list || []); } catch (err) { console.error(err); showToast('Error eliminando rack', 'error'); }
    };

    return (
        <div>
            <div className={styles.headerButtons}>
                {/* Workspace picker - single selection */}
                <div className={styles.searchContainer}>
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
                        selectorTitle="Workspace"
                        listTitle="Workspace activo"
                        singleSelection={true}
                    />
                </div>
                <div className={styles.buttonGroup}>
                    <Button variant='icon-only' onClick={() => fetchAndSetRacks()}><RefreshCcw size={24} /></Button>
                    <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}><Plus size={24} /> Rack Nuevo</Button>
                </div>


            </div>

            <SearchFilterBar onSearchChange={setSearchTerm} />

            <div style={{ marginTop: 12 }}>
                {loading ? <div className={styles.loadingState}><Loader2 className="animate-spin" size={36} /> <p>Cargando racks...</p></div> : error ? <div className={styles.emptyState}><AlertTriangle size={48} /> <p>{error}</p></div> : <DataTable data={filtered} columns={columns} />}
            </div>

            <Dialog isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
                <NewRackForm onClose={() => setIsCreateModalOpen(false)} onSubmit={handleCreate} workspaces={[]} />
            </Dialog>

            <Dialog isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
                <div className={styles.dialogContent}>
                    <div className={styles.dialogHeader}>
                        <h2>Vas a eliminar: {rackToDelete?.name}</h2>
                    </div>
                    <div className={styles.dialogBody}>
                        <p>
                            Estás a punto de eliminar el rack <strong>{rackToDelete?.name}</strong>.
                            Esta acción es irreversible y toda la información asociada se perderá.
                            ¿Estás seguro de continuar?
                        </p>
                        <Button variant="danger" onClick={handleConfirmDelete}><Trash2 size={24} /> Eliminar</Button>
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default RacksTab;