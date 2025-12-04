import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { Home, Settings, Server, Package, PlusCircle, Wifi, Database, Trash, StickyNote, Eye, Loader2, Plus, Info } from 'lucide-react';
import Button from '../../components/ui/button/Button.jsx';
import DataTable from '../../components/ui/table/DataTable.jsx';
import TableActions from '../../components/ui/table/TableActions.jsx';
import Dialog from '../../components/ui/dialog/Dialog.jsx';
// Input removed (unused) now that we use NewRackForm
import NewRackForm from '../../components/form/rack/NewRackForm.jsx';
import { useToast } from '../../components/ui/toasts/ToastProvider.jsx';
import { getAllRacks, createRack, deleteRack } from '../../api/services/rackService.js';
import { getWorkspacesByName } from '../../api/services/workspaceService.js';
import styles from './WorkspaceDetailsPage.module.css';
import InfoPill from '../../components/ui/infopill/InfoPill.jsx';
import DetailViewerCard from '../../components/ui/detailViewer/DetailViewerCard.jsx';
import Rack3DViewerCard from '../../components/3d/rack/Rack3DViewerCard.jsx';

// We'll fetch workspace data and racks via API instead of using mock data

const WorkspaceDetailsPage = () => {
    const { workspaceId } = useParams();
    const location = useLocation();
    const [workspace, setWorkspace] = useState(null);
    const [racks, setRacks] = useState([]);
    const [racksLoading, setRacksLoading] = useState(false);
    const [racksError, setRacksError] = useState(null);
    const [isRackModalOpen, setIsRackModalOpen] = useState(false);
    const [selectedRack, setSelectedRack] = useState(null);

    const { showToast } = useToast();
    const [workspaceLoading, setWorkspaceLoading] = useState(true);
    // isRackModalOpen and newRackName moved above to keep related logic together


    const handleCreateRack = async (rackData) => {
        try {
            // Rack creation requires workspaceName
            const payload = { ...rackData, workspaceName: workspace.name };
            await createRack(payload);
            showToast(`Rack "${payload.name}" creado en el Workspace ${workspace.name}`, 'success');
            setIsRackModalOpen(false);
        } catch (err) {
            console.error('Error creating rack', err);
            const errorMessage = err?.response?.data?.message || err.message || 'Error al crear rack.';
            showToast(errorMessage, 'error');
            throw err;
        }
    };

    const fetchWorkspace = async () => {
        try {
            setWorkspaceLoading(true);
            const data = await getWorkspacesByName(workspaceId);
            setWorkspace(data);
        } catch (err) {
            console.error('Error al cargar workspace:', err);
            showToast('Error al cargar workspace.', 'error');
        } finally {
            setWorkspaceLoading(false);
        }
    };

    const fetchRacks = async () => {
        if (!workspace || !workspace.name) return;
        setRacksLoading(true);
        setRacksError(null);
        try {
            const data = await getAllRacks(workspace.name);
            const list = data || [];
            setRacks(list);
            // Auto-select first rack if none selected or previous selection doesn't belong to this workspace
            if (list.length > 0 && (!selectedRack || (selectedRack.workspaceName && selectedRack.workspaceName !== workspace.name))) {
                setSelectedRack(list[0]);
            }
            return list;
        } catch (err) {
            console.error('Error al obtener racks:', err);
            setRacksError('Error');
            setRacks([]);
        } finally {
            setRacksLoading(false);
        }
    };

    useEffect(() => {
        // If navigation passed a workspace in state, use it to avoid an API call
        if (location?.state?.workspace) {
            setWorkspace(location.state.workspace);
            setWorkspaceLoading(false);
            return;
        }
        fetchWorkspace();
    }, [workspaceId, location]);

    useEffect(() => {
        // Whenever the workspace changes we should reset selection (for a new workspace)
        setSelectedRack(null);
        if (workspace) fetchRacks();
    }, [workspace]);

    const handleRackAction = async (action, id) => {
        const rack = racks.find(r => r.name === id || r.id === id);
        if (!rack) return;

        if (action === 'delete') {
            // The card performs deletion; refresh the racks list and compute new selection
            const wasSelected = selectedRack && (selectedRack.name === rack.name || selectedRack.id === rack.id);
            const newList = await fetchRacks();
            if (wasSelected) {
                // After refresh, select first item if available, else clear
                if (newList && newList.length > 0) {
                    setSelectedRack(newList[0]);
                } else {
                    setSelectedRack(null);
                }
            }
            return;
        }

        if (action === 'view') {
            // Select for details view
            setSelectedRack(rack);
            return;
        }

        showToast(`Acción '${action}' en el Rack: ${rack.name}`, 'info');
        // Aquí se implementaría la navegación a RackDetailsPage o la lógica de edición/eliminación
    };

    const renderHeaderInfo = () => (
        // Se aplica la clase .headerInfo definida en el CSS externo
        <div>
            <div className={styles.headerInfo}>
                <h2>Información</h2>
                <div className={styles.infoGroup}>
                    <InfoPill label="Red Asignada" value={workspace.network || 'N/A'} />
                    <InfoPill label="Descripción" value={workspace.description} isDescription={true} />
                    <InfoPill label="Racks Asignados" value={racks.length} />
                </div>
            </div>
        </div>
    );

    const renderRacksTab = () => (
        <>
            <div className={styles.racksGallery}>
                {racksLoading ? (
                    <div className={styles.loadingState}><Loader2 className="animate-spin" /></div>
                ) : (
                    racks && racks.map(rack => (
                        <Rack3DViewerCard
                            key={rack.name || rack.id}
                            rack={rack}
                            onAction={handleRackAction}
                            selected={selectedRack && (selectedRack.name === rack.name || selectedRack.id === rack.id)} />
                    ))
                )}
            </div>
            {(!racks || racks.length === 0) && (
                <div className={styles.emptyRackGrid} >
                    Aún no hay Racks creados en este Workspace. ¡Comienza añadiendo uno!
                </div>
            )}
        </>
    );

    const renderContent = () => {
        // If racks are still loading show the loader
        if (racksLoading) {
            return (
                <>
                    <div className={styles.content}>
                        <div className={styles.leftColumn}>
                            <DetailViewerCard />
                        </div>
                        <div className={styles.rightColumn}>
                            <div className={styles.rackGrid}><Loader2 className="animate-spin" /></div>
                        </div>
                    </div>
                </>
            );
        }

        // Standard two-column view: left detail view (placeholder if none selected), right gallery
        return (
            <>
                <div className={styles.content}>
                    <div className={styles.rightColumn}>
                        {renderRacksTab()}
                        <div className={styles.buttonGroup}>
                            <Button variant="primary" onClick={() => setIsRackModalOpen(true)}>
                                <Plus size={24} />
                                Añadir Nuevo Rack
                            </Button>
                            <Button variant="primary" onClick={() => showToast('Abriendo Configuración...', 'info')}>
                                <Settings size={24} />
                            </Button>
                        </div>
                    </div>
                </div>
            </>
        );
    };

    // Loading / missing workspace guards
    if (workspaceLoading) {
        return (
            <div className={styles.page}>
                <Loader2 className="animate-spin" /> Cargando workspace...
            </div>
        );
    }

    if (!workspace) {
        return <div className={styles.page}>Workspace no encontrado.</div>;
    }

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1>{workspace.name}</h1>
                <Button
                    variant="primary"
                    onClick={() => showToast('Aquí verás la información más relevante sobre el workspace seleccionado.', 'info')}
                > <Info size={24} />
                </Button>
            </div>
            {renderHeaderInfo()}
            {renderContent()}
            {/* Diálogo de Creación de Rack */}
            <Dialog
                isOpen={isRackModalOpen}
                onClose={() => setIsRackModalOpen(false)}>
                <NewRackForm
                    onClose={() => setIsRackModalOpen(false)}
                    onSubmit={handleCreateRack}
                    workspaces={[workspace]} />
            </Dialog>
        </div>
    );
};

export default WorkspaceDetailsPage;
