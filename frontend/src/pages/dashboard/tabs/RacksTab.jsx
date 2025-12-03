import React, { useState, useEffect, useMemo } from 'react';
import { Trash2, AlertTriangle, Loader2, Plus } from 'lucide-react';
import { useToast } from '../../../components/ui/toasts/ToastProvider.jsx';
import DataTable from '../../../components/ui/table/DataTable.jsx';
import TableActions from '../../../components/ui/table/TableActions.jsx';
import Dialog from '../../../components/ui/dialog/Dialog.jsx';
import Button from '../../../components/ui/button/Button.jsx';
import styles from '../Tab.module.css';
import SearchFilterBar from '../../../components/ui/searchbar/SearchFilterBar.jsx';
import NewRackForm from '../../../components/form/rack/NewRackForm.jsx';
// API
import { getAllRacks, createRack, deleteRack } from '../../../api/services/rackService.js';

const RacksTab = ({ onSelectItem }) => {
    const { showToast } = useToast();
    const [racks, setRacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [rackToDelete, setRackToDelete] = useState(null);

    useEffect(() => {
        (async () => {
            setLoading(true); setError(null);
            try {
                const data = await getAllRacks();
                setRacks(data || []);
            } catch (err) { console.error(err); setError('Error cargando racks'); } finally { setLoading(false); }
        })();
    }, []);

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
                <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}><Plus size={14} /> Crear Rack</Button>
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
                        <Button variant="danger" onClick={handleConfirmDelete}><Trash2 size={20} /> Eliminar</Button>
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default RacksTab;