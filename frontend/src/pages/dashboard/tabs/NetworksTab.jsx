import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Trash2, AlertTriangle, Loader2, Plus, RefreshCcw } from 'lucide-react';
import { useToast } from '../../../components/ui/toasts/ToastProvider.jsx';
import DataTable from '../../../components/ui/table/DataTable.jsx';
import TableActions from '../../../components/ui/table/TableActions.jsx';
import Dialog from '../../../components/ui/dialog/Dialog.jsx';
import Button from '../../../components/ui/button/Button.jsx';
import styles from '../Tab.module.css';
import SearchFilterBar from '../../../components/ui/searchbar/SearchFilterBar.jsx';
import NetworkConfigForm from '../../../components/form/network/NetworkConfigForm.jsx';
// API
import { getAllNetworks, createNetwork, deleteNetworkByName } from '../../../api/services/networkService.js';

const NetworksTab = ({ onSelectItem }) => {
    const { showToast } = useToast();
    const [networks, setNetworks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [componentToDelete, setComponentToDelete] = useState(null);



    const fetchNetworks = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAllNetworks();
            setNetworks(data || []);
        } catch (err) {
            console.error('Error al cargar las redes:', err);
            setError('Error al obtener las redes.');
            showToast('Error de conexión con el servidor.', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNetworks();
    }, [fetchNetworks]);

    const filtered = useMemo(() => {
        if (!searchTerm) return networks;
        const low = searchTerm.toLowerCase();
        return networks.filter(n => (n.name || '').toLowerCase().includes(low) || (n.ipAddress || '').toLowerCase().includes(low));
    }, [networks, searchTerm]);

    const columns = useMemo(() => [
        { header: 'Nombre', key: 'name', render: item => <div onClick={() => onSelectItem && onSelectItem({ ...item, type: 'network' })}>{item.name}</div> },
        { header: 'Dirección Ip', key: 'ipAddress', render: item => item.ipAddress || '—' },
        {
            header: 'Acciones', key: 'actions', className: styles.centerAlign, render: item => (
                <TableActions itemId={item.id} onViewDetails={() => onSelectItem && onSelectItem({ ...item, type: 'network' })} onEdit={() => showToast('Editar red - pendiente', 'info')} onDelete={() => { setComponentToDelete(item); setIsDeleteModalOpen(true); }} />
            )
        }
    ], [onSelectItem, showToast]);

    const handleCreate = async (data) => {
        try {
            await createNetwork(data);
            showToast('Red creada', 'success');
            const list = await getAllNetworks();
            setNetworks(list);
            setIsCreateModalOpen(false);
        } catch (err) {
            console.error(err);
            showToast('Error creando red', 'error'); throw err;
        }
    };

    const handleConfirmDelete = async () => {
        if (!componentToDelete) return;
        try {
            await deleteNetworkByName(componentToDelete.name);
            showToast('Red eliminada', 'success');
            setIsDeleteModalOpen(false);
            const list = await getAllNetworks();
            setNetworks((list || []).filter(c => c.isSelled));
        } catch (err) {
            console.error(err);
            showToast('Error eliminando red', 'error');
        }
    };

    return (
        <div>
            <div className={styles.headerButtons}>
                <div className={styles.searchContainer}></div>
                <div className={styles.buttonGroup}>
                    <Button variant='icon-only' onClick={() => fetchNetworks()}><RefreshCcw size={20} /></Button>
                    <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}><Plus size={14} /> Añadir red</Button>
                </div>
            </div>

            <SearchFilterBar onSearchChange={setSearchTerm} />

            <div style={{ marginTop: 12 }}>
                {loading ? <div className={styles.loadingState}><Loader2 className="animate-spin" size={36} /> <p>Cargando redes...</p></div> : error ? <div className={styles.emptyState}><AlertTriangle size={48} /> <p>{error}</p></div> : <DataTable data={filtered} columns={columns} />}
            </div>

            <Dialog isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
                <NetworkConfigForm onClose={() => setIsCreateModalOpen(false)} onSubmit={handleCreate} />
            </Dialog>

            <Dialog isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
                <div style={{ padding: 12 }}>
                    <h3>Confirmar</h3>
                    <p>Eliminar Red <strong>{componentToDelete?.name}</strong>?</p>
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</Button>
                        <Button variant="danger" onClick={handleConfirmDelete}><Trash2 size={14} /> Eliminar</Button>
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default NetworksTab;