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
import NewServerForm from '../../../components/form/server/NewServerForm.jsx';
// API
import { getAllRacks, createRack, deleteRack, addServerToRack } from '../../../api/services/rackService.js';
import { getAllWorkspaces } from '../../../api/services/workspaceService.js';
import { getAllServers } from '../../../api/services/serverService.js';

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

    const [isCreateServerModalOpen, setIsCreateServerModalOpen] = useState(false);
    const [isSelectOrCreateDialogOpen, setIsSelectOrCreateDialogOpen] = useState(false);
    const [existingServers, setExistingServers] = useState([]);
    const [serversLoading, setServersLoading] = useState(false);
    const [serversError, setServersError] = useState(null);

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
        {
            header: 'Rack', key: 'name', render: item => <div onClick={() => {
                onSelectItem && onSelectItem({ ...item, type: 'rack' });
                setSelectedRack(item);
            }}>{item.name}</div>
        },
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

    const handleAddOrCreateServer = async () => {
        // check backend for existing servers — if any exist, show a choice dialog
        if (!selectedRack) return;
        setServersLoading(true);
        setServersError(null);
        try {
            const list = await getAllServers();
            if (list && list.length > 0) {
                setExistingServers(list);
                setIsSelectOrCreateDialogOpen(true);
            } else {
                setIsCreateServerModalOpen(true);
            }
        } catch (err) {
            console.error('Error fetching servers', err);
            setServersError('Error cargando servidores');
            // fallback to create if fetch fails
            setIsCreateServerModalOpen(true);
        } finally {
            setServersLoading(false);
        }
    }

    const handleAddServerToRack = async (server) => {
        {
            // Attach selected server to the selected rack
            if (!selectedRack) return showToast('Selecciona primero un rack', 'error');
            try {
                await addServerToRack(selectedRack.name, server.name);
                // refresh racks
                const updated = await fetchAndSetRacks();
                const updatedSelected = (updated || []).find(r => r.name === selectedRack.name);
                setSelectedRack(updatedSelected || selectedRack);
                showToast(`Servidor ${server.name} añadido al rack ${selectedRack.name}.`, 'success');
            } catch (err) {
                console.error('Error adding server to rack', err);
                showToast('Error al añadir servidor', 'error');
            } finally {
                setIsSelectOrCreateDialogOpen(false);
            }
        }
    }

    const handleCreateServer = async (serverData) => {
        // The form will include rackName (if selected) but we ensure it targets the selectedRack
        if (!selectedRack) {
            showToast('Selecciona primero un rack para añadir el servidor.', 'error');
            return;
        }
        try {
            // 1) Create the server object in the system
            const server = await createServer(serverData);

            // 2) Attach server to rack
            const serverName = server?.name || server.name || serverData.name;
            await addServerToRack(selectedRack.name, serverName);

            // 3) Refresh racks and selection
            const updated = await fetchAndSetRacks();
            const updatedSelected = (updated || []).find(r => r.name === selectedRack.name);
            setSelectedRack(updatedSelected || selectedRack);

            showToast(`Servidor ${serverName} añadido al rack ${selectedRack.name}.`, 'success');
        } catch (err) {
            console.error('Error creating/attaching server', err);
            showToast('Error al crear o añadir el servidor', 'error');
        } finally {
            setIsCreateServerModalOpen(false);
        }
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
                    <Button variant="primary" onClick={async () => handleAddOrCreateServer()} disabled={!selectedRack}><Plus size={24} />Añadir Servidor</Button>
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

            {/* Create Server dialog (only when there is a selected rack) */}
            {/* Select vs Create dialog (shown when servers exist) */}
            <Dialog
                isOpen={isSelectOrCreateDialogOpen}
                onClose={() => setIsSelectOrCreateDialogOpen(false)}>
                <div className={styles.dialogContent}>
                    <div className={styles.dialogHeader}>
                        <h2 className={styles.dialogTitle}>¿Seleccionar o crear servidor?</h2>
                        <p>Hay servidores existentes en el sistema. ¿Quieres seleccionar uno para añadirlo al rack, o crear uno nuevo?</p>
                    </div>
                    <div className={styles.dialogBody}>

                        {serversLoading ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Loader2 className="animate-spin" /> Cargando...</div>
                        ) : serversError ? (
                            <div className={styles.emptyState}><AlertTriangle /> Error cargando servidores</div>
                        ) : (
                            <GenericSelector
                                availableItems={existingServers}
                                compatibleItems={[]}
                                onAddComponent={async (server) => handleAddServerToRack(server)}
                                isLoading={serversLoading}
                                selectorTitle="Buscar servidor existente"
                                listTitle="Servidor seleccionado"
                                singleSelection={true}
                            />
                        )}
                        <Button variant="primary" onClick={() => {
                            setIsSelectOrCreateDialogOpen(false);
                            setIsCreateServerModalOpen(true);
                        }}>Crear servidor nuevo</Button>
                    </div>
                </div>
            </Dialog>
            <Dialog
                isOpen={isCreateServerModalOpen}
                onClose={() => setIsCreateServerModalOpen(false)}>
                <NewServerForm
                    racks={selectedRack ? [selectedRack, ...racks.filter(r => r.name !== selectedRack.name)] : racks}
                    initialSelectedRack={selectedRack}
                    initialActiveWorkspace={activeWorkspace}
                    onClose={() => setIsCreateServerModalOpen(false)}
                    onSubmit={async (serverData) => handleCreateServer(serverData)}
                />
            </Dialog>
        </div>
    );
};

export default RacksTab;