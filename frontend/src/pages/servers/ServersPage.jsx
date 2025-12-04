import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Trash2, AlertTriangle, Server, Cpu, Save, Plus, Loader2 } from 'lucide-react';
import { useToast } from '../../components/ui/toasts/ToastProvider.jsx';
import DataTable from '../../components/ui/table/DataTable.jsx';
import TableActions from '../../components/ui/table/TableActions.jsx';
import Dialog from '../../components/ui/dialog/Dialog.jsx';
import Input from '../../components/ui/input/InputField.jsx';
import Button from '../../components/ui/button/Button.jsx';
import SearchFilterBar from '../../components/ui/searchbar/SearchFilterBar.jsx';
import DetailViewerCard from '../../components/ui/detailViewer/DetailViewerCard.jsx';
import NewServerForm from '../../components/form/server/NewServerForm.jsx';

import styles from '../Page.module.css';

//API Services
import { getAllServers, deleteServer, getServerTotalCost, getServerComponents } from '../../api/services/serverService.js';

// --- FUNCIÓN DE PREPROCESAMIENTO ---
/**
 * Convierte el objeto de servidor a un esquema listo para DetailViewerCard.
 * @param {object} serverItem - Objeto de servidor del mock.
 * @returns {object} Esquema de detalles listo para renderizar.
 */
const createServerSchema = (serverItem) => {
    if (!serverItem) return null;

    // 1. Mapear los detalles básicos y formateados
    const details = [
        { label: 'Sistema Operativo', value: serverItem.operatingSystem },
        { label: 'Estado', value: serverItem.status, isStatus: true }, // isStatus para el formato de color
        { label: 'Salud', value: serverItem.healthStatus },
        { label: 'Dirección IP', value: serverItem.ipAddress },
        { label: 'Red', value: serverItem.network },
        { label: 'Coste Mantenimiento', value: `${serverItem.totalMaintenanceCost} €/Mes` },
        { label: 'Precio Total', value: `${serverItem.totalPrice} €` },

        // 2. Mapear la lista de componentes usando el formato de lista de DetailViewerCard
        {
            label: 'Componentes Instalados',
            isList: true,
            // Asumimos que GenericList espera objetos con una propiedad 'name'
            items: serverItem.components.map(comp => ({ name: comp.name }))
        }
    ];

    // 3. Devolver el objeto de esquema completo
    return {
        name: serverItem.name,
        description: serverItem.description,
        modelPath: serverItem.modelPath || '/assets/models/server-full-rack.glb',
        type: 'server',
        details: details,
        // En servidores, la compatibilidad puede no ser relevante, o podría ser la lista de racks compatibles
        // Por simplicidad, se deja vacío o se adapta si es necesario.
        compatibilityItems: [],
    };
};

const ServersPage = () => {
    const { showToast } = useToast();

    const [servers, setServers] = useState([]);
    const [activeServer, setActiveServer] = useState(null);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [serverToDelete, setServerToDelete] = useState(null);

    const [loading, setLoading] = useState(true); // 👈 Nuevo estado de carga
    const [error, setError] = useState(null); // 👈 Nuevo estado de error
    const [searchTerm, setSearchTerm] = useState('');

    // --- 1. FUNCIÓN CENTRAL DE FETCH (Recarga) ---
    const fetchAndSetServers = useCallback(async (initialLoad = false) => {
        setLoading(true);
        setError(null);

        try {
            const data = await getAllServers();
            setServers(data);

            if (data.length > 0) {
                // Solo inicializamos o re-seleccionamos si es necesario
                setActiveServer(prevActive => {
                    if (initialLoad || !prevActive) {
                        return data[0];
                    }
                    return prevActive; // Mantenemos el activo actual si ya existe
                });
            } else {
                setActiveServer(null); // Si no hay datos, limpiamos el activo
            }
        } catch (err) {
            console.error('Error al cargar los servidores:', err);
            setError('Error al obtener los servidores. Asegúrate de que el backend esté funcionando.');
            showToast('Error de conexión con el servidor.', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    // --- 2. EFECTO DE CARGA INICIAL ---
    useEffect(() => {
        // Al montar, llamamos a la función con initialLoad=true
        fetchAndSetServers(true);
    }, [fetchAndSetServers]);

    // --- 1. CREACIÓN DEL SCHEMA PARA EL DETAIL VIEWERCARD ---
    const serverDetailsSchema = useMemo(() => {
        return createServerSchema(activeServer);
    }, [activeServer]);

    // Lógica de filtrado
    const filteredServers = useMemo(() => {
        if (!searchTerm) {
            return servers;
        }
        const lowerCaseSearch = searchTerm.toLowerCase();
        return servers.filter(srv =>
            srv.name.toLowerCase().includes(lowerCaseSearch) ||
            srv.operatingSystem.toLowerCase().includes(lowerCaseSearch)
        );
    }, [servers, searchTerm]);

    //Handlers
    const handleCloseNewServerModal = (creationSuccessful = false) => {
        setIsCreateModalOpen(false);
        if (creationSuccessful) {
            // NewServerForm ya muestra su propio toast de éxito tras la simulación de envío,
            // pero si tuviéramos que añadir los datos del servidor a la lista padre, 
            // la lógica iría aquí. Por ahora, solo cerramos el modal.
        }
    };

    const handleDeleteServer = (server) => {
        setServerToDelete(server);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (!serverToDelete) return;

        setServers(prev => prev.filter(srv => srv.name !== serverToDelete.name));
        showToast(`Servidor "${serverToDelete.name}" eliminado permanentemente.`, 'error');

        setIsDeleteModalOpen(false);
        setServerToDelete(null);
    };

    const handleTableAction = (action, id) => {
        const server = servers.find(srv => srv.name === name);
        if (!server) return;

        if (action === 'delete') {
            handleDeleteServer(server);
        } else if (action === 'view') {
            setActiveServer(server);
            showToast(`Visualizando detalles de ${server.name}.`, 'info');
        }
    };

    const handleFilterClick = () => {
        showToast('Abriendo opciones avanzadas de filtro de servidores.', 'info');
    };

    // Definición de las columnas para el componente DataTable (MOCKS de renderizado)
    const columns = useMemo(() => [
        {
            header: 'Nombre del Servidor',
            key: 'name',
            render: (item) => (
                // Asumiendo que el componente DataTable no requiere la importación de estilos de celda
                <div
                    className={`${styles.nameCellLink} ${item.name === activeServer?.name ? styles.activeName : ''}`}
                    onClick={() => handleTableAction('view', item.name)}>
                    {item.name}
                </div>
            )
        },
        {
            header: 'OS',
            key: 'operatingSystem',
            render: (item) => <span>{item.operatingSystem}</span>
        },
        {
            header: 'Acciones',
            key: 'actions',
            className: styles.centerAlign,
            // NOTA: 'TableActions' es un componente externo, asumimos que se renderiza correctamente
            render: (item) => (
                <TableActions
                    itemId={item.name}
                    onViewDetails={(name) => handleTableAction('view', name)}
                    onDelete={(name) => handleTableAction('delete', name)}
                />
            )
        },
    ], [activeServer, servers]); // Dependencia del useMemo para que las funciones de acción usen el estado actual

    // --- 5. CONTENIDO CONDICIONAL DE LA LISTA ---
    const listContent = useMemo(() => {
        if (loading) {
            return (
                <div className={styles.loadingState}>
                    <Loader2 size={36} className="animate-spin" />
                    <p>Cargando Servidores...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className={styles.emptyState}>
                    <AlertTriangle size={48} className={styles.errorIcon} />
                    <p>Ocurrió un error al cargar los datos.</p>
                    <p className={styles.errorText}>{error}</p>
                    <Button variant="secondary" onClick={() => fetchAndSetServers(true)}>Reintentar Carga</Button>
                </div>
            );
        }

        if (filteredServers.length === 0 && searchTerm) {
            return (
                <div className={styles.emptyState}>
                    <AlertTriangle size={48} className={styles.emptyIcon} />
                    <p>No se encontraron servidores que coincidan con "{searchTerm}".</p>
                </div>
            );
        }

        if (filteredServers.length === 0 && !searchTerm) {
            return (
                <div className={styles.emptyState}>
                    <Server size={48} className={styles.emptyIcon} />
                    <p>No tienes servidores activos. ¡Crea el primero para desplegar tu infraestructura!</p>
                </div>
            );
        }

        return (
            <div className={styles.tableContainer}>
                <DataTable
                    data={filteredServers}
                    columns={columns}
                    initialSortBy="name"
                    initialSortDirection="asc"
                />
            </div>
        );
    }, [loading, error, filteredServers, searchTerm, columns, fetchAndSetServers]);

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <h1>
                    Mis Servidores
                </h1>
            </header>

            {/* Implementación de la cuadrícula de dos columnas */}
            <div className={styles.contentGrid}>

                {/* Columna de Visualización / Detalles */}
                <div className={styles.visualizerColumn}>
                    {serverDetailsSchema ? (
                        <DetailViewerCard
                            name={serverDetailsSchema.name}
                            description={serverDetailsSchema.description}
                            modelPath={serverDetailsSchema.modelPath}
                            details={serverDetailsSchema.details}
                            type={serverDetailsSchema.type}
                            compatibilityItems={serverDetailsSchema.compatibilityItems}
                        />
                    ) : (
                        // Placeholder si no hay servidor seleccionado
                        <div className={styles.viewerCardPlaceholder}>
                            <h3>Selecciona un Servidor</h3>
                            <p>Haz clic en el nombre para visualizar los detalles.</p>
                        </div>
                    )}
                </div>

                {/* Columna de la Lista y Acciones */}
                <div className={styles.listColumn}>
                    {/* Contenedor de Búsqueda y Botón */}
                    <SearchFilterBar
                        onSearchChange={setSearchTerm}
                        onFilterClick={handleFilterClick}
                        searchPlaceholder="Buscar por nombre, OS, región o ID..."
                    />

                    {listContent}

                    <div className={styles.listColumnFooter}>
                        <Button
                            variant="primary"
                            onClick={() => setIsCreateModalOpen(true)}
                        >
                            <Plus size={24} style={{ marginRight: '5px' }} />
                            Crear Servidor
                        </Button>
                    </div>


                </div>
            </div>

            {/* Diálogos (Creación y Eliminación) - Se mantienen sin cambios */}
            <Dialog
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}>
                <NewServerForm
                    // Pasamos la función de cierre para que el formulario la llame tras el envío exitoso
                    onClose={handleCloseNewServerModal}
                />
            </Dialog>

            <Dialog isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
                <div className={styles.dialogContent}>
                    <header className={`${styles.dialogHeader} ${styles.dialogDanger}`}>
                        <AlertTriangle size={24} style={{ marginRight: '10px' }} />
                        <h2 className={styles.dialogTitle}>Confirmar Eliminación: {serverToDelete?.name}</h2>
                    </header>
                    <div className={styles.dialogBody}>
                        <p className="text-gray-300">
                            Estás a punto de eliminar el servidor <strong>{serverToDelete?.name}</strong>.
                            Esta acción es irreversible, lo que resultará en la pérdida de la máquina virtual y sus datos.
                            ¿Estás seguro de que quieres terminar la instancia?
                        </p>
                    </div>
                    <footer className={styles.dialogFooter}>
                        <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</Button>
                        <Button variant="danger" onClick={handleConfirmDelete}><Trash2 size={18} style={{ marginRight: '5px' }} />Eliminar Servidor</Button>
                    </footer>
                </div>
            </Dialog>
        </div>
    );
};

export default ServersPage;