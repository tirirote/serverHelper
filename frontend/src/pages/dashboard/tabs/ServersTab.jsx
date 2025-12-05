import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Trash2, AlertTriangle, Loader2, Plus, RefreshCcw } from 'lucide-react';
import { useToast } from '../../../components/ui/toasts/ToastProvider.jsx';
import DataTable from '../../../components/ui/table/DataTable.jsx';
import TableActions from '../../../components/ui/table/TableActions.jsx';
import Dialog from '../../../components/ui/dialog/Dialog.jsx';
import Button from '../../../components/ui/button/Button.jsx';
import styles from '../Tab.module.css';
import SearchFilterBar from '../../../components/ui/searchbar/SearchFilterBar.jsx';
import NewServerForm from '../../../components/form/server/NewServerForm.jsx';
// API
import { getAllServers, createServer, deleteServer } from '../../../api/services/serverService.js';

const ServersTab = ({ onSelectItem }) => {
    const { showToast } = useToast();
    const [servers, setServers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [serverToDelete, setServerToDelete] = useState(null);

    

    const fetchServers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAllServers();
            setServers(data || []);
        } catch (err) {
            console.error('Error al cargar los servidores:', err);
            setError('Error al obtener las servidores.');
            showToast('Error de conexión con el servidor.', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchServers();
    }, [fetchServers]);

    const filtered = useMemo(() => {
        if (!searchTerm) return servers;
        const low = searchTerm.toLowerCase();
        return servers.filter(s => (s.name || '').toLowerCase().includes(low) || (s.operatingSystem || '').toLowerCase().includes(low));
    }, [servers, searchTerm]);

    const columns = useMemo(() => [
        { header: 'Servidor', key: 'name', render: item => <div onClick={() => onSelectItem && onSelectItem({ ...item, type: 'server' })}>{item.name}</div> },
        { header: 'Estado', key: 'healthStatus', render: item => <div>{item.healthStatus}</div> },
        { header: 'OS', key: 'operatingSystem', render: item => item.operatingSystem || '—' },
        {
            header: 'Acciones', key: 'actions', className: styles.centerAlign, render: item => (
                <TableActions itemId={item.name} onViewDetails={() => onSelectItem && onSelectItem({ ...item, type: 'server' })} onEdit={() => showToast('Editar servidor - pendiente', 'info')} onDelete={() => { setServerToDelete(item); setIsDeleteModalOpen(true); }} />
            )
        }
    ], [onSelectItem, showToast]);

    const handleCreate = async (data) => {
        try {
            await createServer(data);
            showToast('Servidor creado', 'success');
            const list = await getAllServers();
            setServers(list || []);
            setIsCreateModalOpen(false);
        } catch (err) {
            console.error(err);
            showToast('Error creando servidor', 'error');
            throw err;
        }
    };

    const handleConfirmDelete = async () => {
        if (!serverToDelete) return;
        try {
            await deleteServer(serverToDelete.name);
            showToast('Servidor eliminado', 'success');
            setIsDeleteModalOpen(false);
            const list = await getAllServers();
            setServers(list || []);
        } catch (err) {
            console.error(err);
            showToast('Error eliminando servidor', 'error');
        }
    };

    return (
        <div>
            <div className={styles.headerButtons}>
                <div className={styles.searchContainer}></div>
                <div className={styles.buttonGroup}>
                    <Button variant='icon-only' onClick={() => fetchServers()}><RefreshCcw size={24} /></Button>
                    <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}><Plus size={24} /> Servidor nuevo</Button>
                </div>
            </div>

            <SearchFilterBar onSearchChange={setSearchTerm} />

            <div style={{ marginTop: 12 }}>
                {loading ? <div className={styles.loadingState}><Loader2 className="animate-spin" size={36} /> <p>Cargando servidores...</p></div> : error ? <div className={styles.emptyState}><AlertTriangle size={48} /> <p>{error}</p></div> : <DataTable data={filtered} columns={columns} />}
            </div>

            <Dialog isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
                <NewServerForm onClose={() => setIsCreateModalOpen(false)} onSubmit={handleCreate} />
            </Dialog>



            <Dialog isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
                <div className={styles.dialogContent}>
                    <div className={styles.dialogHeader}>
                        <h2>Vas a eliminar: {serverToDelete?.name}</h2>
                    </div>
                    <div className={styles.dialogBody}>
                        <p>
                            Estás a punto de eliminar el servidor <strong>{serverToDelete?.name}</strong>.
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

export default ServersTab;