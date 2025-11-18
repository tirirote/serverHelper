import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Server, Trash2, Zap, AlertTriangle, ArrowRight, XCircle, ChevronRight, Loader2, Plus } from 'lucide-react';

// Componentes externos simulados
import { useToast } from '../../components/ui/toasts/ToastProvider.jsx';
import DataTable from '../../components/ui/table/DataTable.jsx';
import TableActions from '../../components/ui/table/TableActions.jsx';
import Dialog from '../../components/ui/dialog/Dialog.jsx';
import Button from '../../components/ui/button/Button.jsx';
import SearchFilterBar from '../../components/ui/searchbar/SearchFilterBar.jsx';

import DetailViewerCard from '../../components/ui/detailViewer/DetailViewerCard.jsx';
import NewComponentForm from '../../components/form/component/NewComponentForm.jsx';
//API Services
import { getAllComponents } from '../../api/services/componentService.js';

// Componentes internos

import styles from './MyComponents.module.css';

const MyComponents = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [components, setComponents] = useState([]);
    const [loading, setLoading] = useState(true); // Inicia cargando
    const [error, setError] = useState(null); // Estado para errores de API
    const [searchTerm, setSearchTerm] = useState('');

    // Estados para la eliminación
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [componentToDelete, setComponentToDelete] = useState(null);

    const [isNewComponentModalOpen, setIsNewComponentModalOpen] = useState(false);

    // Estado para el componente visualizado en 3D
    const [activeComponent, setActiveComponent] = useState(null);

    const fetchComponents = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Llama a la función de API que usa apiClient.get('/components')
            const data = await getAllComponents();
            setComponents(data);

            // Establecer el primer componente cargado como activo
            if (data && data.length > 0) {
                setActiveComponent(data[0]);
            }

        } catch (err) {
            console.error('Error al cargar componentes:', err);
            setError('Error al obtener los datos del servidor. Asegúrate de que el backend esté funcionando.');
            showToast('Error de conexión con el servidor.', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]); // Dependencia del Toast

    useEffect(() => {
        fetchComponents();
    }, [fetchComponents]);

    // Lógica de filtrado
    const filteredComponents = useMemo(() => {
        if (!searchTerm) {
            return components;
        }
        const lowerCaseSearch = searchTerm.toLowerCase();
        return components.filter(comp =>
            comp.name.toLowerCase().includes(lowerCaseSearch) ||
            comp.type.toLowerCase().includes(lowerCaseSearch) ||
            comp.vendor.toLowerCase().includes(lowerCaseSearch) ||
            comp.id.toLowerCase().includes(lowerCaseSearch)
        );
    }, [components, searchTerm]);

    // Navegación simulada a la tienda
    const handleGoToStore = () => {
        showToast('Navegando a la tienda de componentes.', 'info');
        navigate('/shop'); // Simulación de ruta
    };

    // Abre el Dialog de confirmación de eliminación
    const handleDeleteComponent = (component) => {
        setComponentToDelete(component);
        setIsDeleteModalOpen(true);
    };

    // Finaliza la eliminación después de la confirmación
    const handleConfirmDelete = () => {
        if (!componentToDelete) return;

        setComponents(prev => {
            const newComponents = prev.filter(comp => comp.id !== componentToDelete.id);
            // Si el componente eliminado era el activo, establece el primero de la lista como activo
            if (activeComponent && activeComponent.id === componentToDelete.id) {
                setActiveComponent(newComponents[0] || null);
            }
            return newComponents;
        });
        showToast(`Componente "${componentToDelete.name}" retirado del inventario.`, 'error');

        setIsDeleteModalOpen(false);
        setComponentToDelete(null);
    };

    const handleOpenNewComponentModal = () => setIsNewComponentModalOpen(true);

    const handleCloseNewComponentModal = (refresh = false) => {
        setIsNewComponentModalOpen(false);
        // Opcional: Si el formulario de creación fue exitoso, recargar datos
        if (refresh) {
            // En un entorno real, aquí harías fetchComponents()
            showToast('Nuevo componente añadido (Simulación).', 'success');
        }
    };

    // Maneja las acciones de la tabla
    const handleTableAction = (action, name) => {
        const component = components.find(comp => comp.name === name);
        if (!component) return;

        if (action === 'delete') {
            handleDeleteComponent(component);
        } else if (action === 'view') {
            // Acción "view" en esta página cambia el modelo 3D activo
            setActiveComponent(component);
            showToast(`Visualizando modelo 3D de ${component.name}.`, 'success');
        }
    };

    // Definición de las columnas para el componente DataTable
    const columns = useMemo(() => [
        {
            header: 'Nombre del Componente',
            key: 'name',
            render: (item) => (
                // Al hacer clic en el nombre, se activa la vista 3D
                <div
                    className={`${styles.nameCellLink} ${item.name === activeComponent?.name ? styles.activeName : ''}`}
                    onClick={() => handleTableAction('view', item.name)}
                >
                    {item.name}
                </div>
            )
        },
        {
            header: 'Acciones',
            key: 'actions',
            className: styles.centerAlign,
            render: (item) => (
                <TableActions
                    itemId={item.id}
                    onViewDetails={(id) => handleTableAction('view', id)} // Usado para activar la vista 3D
                    onDelete={(id) => handleTableAction('delete', id)}
                    viewLabel="Ver 3D"
                    deleteLabel="Retirar"
                />
            )
        },
    ], [components, activeComponent]);


    return (
        <div className={styles.myComponentsPage}>
            <header className={styles.header}>
                <h1>
                    Inventario de Componentes
                </h1>
            </header>

            <div className={styles.contentGrid}>
                {/* Columna de Visualización 3D */}
                <div className={styles.visualizerColumn}>
                    <DetailViewerCard item={activeComponent} />
                </div>

                {/* Columna de la Lista y Búsqueda */}
                <div className={styles.listColumn}>
                    <SearchFilterBar
                        onSearchChange={setSearchTerm}
                        searchPlaceholder="Buscar por nombre, tipo o proveedor..."
                    />

                    <div className={styles.tableContainer}>
                        {/* NUEVOS ESTADOS DE CARGA Y ERROR */}
                        {loading && (
                            <div className={styles.loadingState}>
                                <Loader2 size={40} className="animate-spin" />
                                <p>Cargando componentes desde el servidor...</p>
                            </div>
                        )}

                        {error && !loading && (
                            <div className={styles.emptyState}>
                                <XCircle size={40} />
                                <p>{error}</p>
                                <p>Intenta recargar la página o revisa la consola para más detalles.</p>
                            </div>
                        )}

                        {/* Lógica de Lista (Solo si no está cargando y no hay error) */}
                        {!loading && !error && (
                            <>
                                {filteredComponents.length === 0 && searchTerm ? (
                                    <div className={styles.emptyState}>
                                        <XCircle size={40} className={styles.emptyIcon} />
                                        <p>No se encontraron componentes que coincidan con "{searchTerm}".</p>
                                    </div>
                                ) : filteredComponents.length === 0 && !searchTerm ? (
                                    <div className={styles.emptyState}>
                                        <ShoppingBag size={40} className={styles.emptyIcon} />
                                        <p>Tu inventario está vacío. ¡Visita la tienda para empezar!</p>
                                    </div>
                                ) : (
                                    <DataTable
                                        data={filteredComponents}
                                        columns={columns}
                                        initialSortBy="name"
                                    />
                                )}
                            </>
                        )}
                    </div>
                    <div className={styles.listColumnFooter}>
                        <Button
                            variant="primary"
                            onClick={handleOpenNewComponentModal}
                        >
                            <Plus size={20} />
                            Nuevo Componente
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleGoToStore}
                        >
                            <ShoppingBag size={20} />Tienda
                        </Button>
                    </div>
                </div>
            </div>

            {/* Dialogo de Confirmación de Eliminación */}
            <Dialog
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Confirmar Retiro de Inventario"
                confirmText="Retirar Componente"
                confirmVariant="danger"
            >
                <div className={styles.dialogDangerContent}>
                    <AlertTriangle size={24} style={{ marginRight: '10px' }} className="text-red-500" />
                    <div>
                        <p className="text-gray-700">
                            Estás a punto de retirar el componente <strong>{componentToDelete?.name}</strong> del inventario.
                            Esta acción asume que has desinstalado el hardware físicamente.
                            ¿Confirmas la retirada?
                        </p>
                    </div>
                </div>
            </Dialog>
            <Dialog
                isOpen={isNewComponentModalOpen}
                onClose={() => handleCloseNewComponentModal(false)}
                title="Añadir Nuevo Componente"
                hideConfirmButton={true}
            >
                {/* El formulario gestiona su propio envío y cierre */}
                <NewComponentForm 
                    // Pasamos la función de cierre para que el formulario la llame tras el envío exitoso
                    onClose={() => handleCloseNewComponentModal(true)} 
                />
            </Dialog>
        </div>
    );
};

export default MyComponents;