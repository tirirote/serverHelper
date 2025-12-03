import React, { useState, useEffect, useMemo } from 'react';
import { Trash2, AlertTriangle, Loader2, Plus } from 'lucide-react';
import { useToast } from '../../../components/ui/toasts/ToastProvider.jsx';
import DataTable from '../../../components/ui/table/DataTable.jsx';
import TableActions from '../../../components/ui/table/TableActions.jsx';
import Dialog from '../../../components/ui/dialog/Dialog.jsx';
import Button from '../../../components/ui/button/Button.jsx';
import styles from '../Tab.module.css';
import SearchFilterBar from '../../../components/ui/searchbar/SearchFilterBar.jsx';
import NewComponentForm from '../../../components/form/component/NewComponentForm.jsx';
// API
import { getAllComponents, createComponent, deleteComponent } from '../../../api/services/componentService.js';

const ComponentsTab = ({ onSelectItem }) => {
    const { showToast } = useToast();
    const [components, setComponents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [componentToDelete, setComponentToDelete] = useState(null);

    useEffect(() => { (async () => { setLoading(true); setError(null); try { const data = await getAllComponents(); setComponents((data || []).filter(c => c.isSelled)); } catch (err) { console.error(err); setError('Error cargando componentes'); } finally { setLoading(false); } })(); }, []);

    const filtered = useMemo(() => {
        if (!searchTerm) return components;
        const low = searchTerm.toLowerCase();
        return components.filter(c => (c.name || '').toLowerCase().includes(low) || (c.type || '').toLowerCase().includes(low) || (c.vendor || '').toLowerCase().includes(low));
    }, [components, searchTerm]);

    const columns = useMemo(() => [
        { header: 'Nombre', key: 'name', render: item => <div onClick={() => onSelectItem && onSelectItem({ ...item, type: 'component' })}>{item.name}</div> },
        { header: 'Tipo', key: 'type', render: item => item.type || '—' },
        {
            header: 'Acciones', key: 'actions', className: styles.centerAlign, render: item => (
                <TableActions itemId={item.id} onViewDetails={() => onSelectItem && onSelectItem({ ...item, type: 'component' })} onEdit={() => showToast('Editar componente - pendiente', 'info')} onDelete={() => { setComponentToDelete(item); setIsDeleteModalOpen(true); }} />
            )
        }
    ], [onSelectItem, showToast]);

    const handleCreate = async (data) => {
        try { await createComponent(data); showToast('Componente creado', 'success'); const list = await getAllComponents(); setComponents((list || []).filter(c => c.isSelled)); setIsCreateModalOpen(false); } catch (err) { console.error(err); showToast('Error creando componente', 'error'); throw err; }
    };

    const handleConfirmDelete = async () => {
        if (!componentToDelete) return;
        try { await deleteComponent(componentToDelete.name); showToast('Componente eliminado', 'success'); setIsDeleteModalOpen(false); const list = await getAllComponents(); setComponents((list || []).filter(c => c.isSelled)); } catch (err) { console.error(err); showToast('Error eliminando componente', 'error'); }
    };

    return (
        <div>
            <div className={styles.headerButtons}>
                <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}><Plus size={14} /> Añadir Componente</Button>
            </div>

            <SearchFilterBar onSearchChange={setSearchTerm} />

            <div style={{ marginTop: 12 }}>
                {loading ? <div className={styles.loadingState}><Loader2 className="animate-spin" size={36} /> <p>Cargando componentes...</p></div> : error ? <div className={styles.emptyState}><AlertTriangle size={48} /> <p>{error}</p></div> : <DataTable data={filtered} columns={columns} />}
            </div>

            <Dialog isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
                <NewComponentForm onClose={() => setIsCreateModalOpen(false)} onSubmit={handleCreate} />
            </Dialog>

            <Dialog isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
                <div className={styles.dialogContent}>
                    <div className={styles.dialogHeader}>
                        <h2>Vas a eliminar: {componentToDelete?.name}</h2>
                    </div>
                    <div className={styles.dialogBody}>
                        <p>
                            Estás a punto de eliminar el componente <strong>{componentToDelete?.name}</strong>.
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

export default ComponentsTab;