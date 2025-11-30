import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { ShoppingCart, Server, Package, Cpu, HardDrive, PlusCircle, MemoryStick, Eye, Loader2, Plus, Info } from 'lucide-react';
import { useToast } from '../../components/ui/toasts/ToastProvider.jsx';
import SearchFilterBar from '../../components/ui/searchbar/SearchFilterBar.jsx';
import Button from '../../components/ui/button/Button.jsx';
import ModelViewer from '../../components/3d/ModelViewer.jsx';
import ShopPageDetails from './ShopPageDetails.jsx';
import styles from './ShopPage.module.css';
import { useNavigate } from 'react-router-dom';
import NewComponentForm from '../../components/form/component/NewComponentForm.jsx';
// API Services
import { getAllComponents, createComponent, updateComponent } from '../../api/services/componentService.js'; // Importar la función de la API
import Dialog from '../../components/ui/dialog/Dialog.jsx';

const ShopPage = () => {
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [isFormOpen, setIsFormOpen] = useState(false);
    // NUEVOS ESTADOS para manejar datos y carga
    const [shopItems, setShopItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');

    const fetchShopItems = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Llama a la función de API (que usa apiClient.get('/components'))
            const data = await getAllComponents();
            setShopItems(data);
        } catch (err) {
            console.error('Error al cargar artículos de la tienda:', err);
            setError('Error al obtener los artículos de la tienda. Asegúrate de que el backend esté funcionando.');
            showToast('Error de conexión con el servidor.', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    // 2. EFECTO PARA CARGAR DATOS AL MONTAR
    useEffect(() => {
        fetchShopItems();
    }, [fetchShopItems]);

    // Lógica de filtrado de la tienda
    const filteredItems = useMemo(() => {
        if (!searchTerm) {
            return shopItems;
        }
        const lowerCaseSearch = searchTerm.toLowerCase();
        return shopItems.filter(item =>
            item.name.toLowerCase().includes(lowerCaseSearch) ||
            item.details.toLowerCase().includes(lowerCaseSearch) ||
            item.type.toLowerCase().includes(lowerCaseSearch)
        );
    }, [shopItems, searchTerm]);

    const handleCreateComponent = async (componentData) => {
        try {

            const response = await createComponent(componentData);

            const newComponent = response.component;
            showToast(`Componente '${newComponent.name}' creado con éxito.`, 'success');

            await fetchShopItems();
            setIsFormOpen(false);

        } catch (err) {
            console.error('Error creando componente:', err);
            showToast('Error al crear componente.', 'error');
            throw err;
        }
    };

    const handleViewDetails = (item) => {
        try {
            // 1. Guardar el objeto completo en localStorage
            localStorage.setItem('selectedShopItemData', JSON.stringify(item));

            // 2. Navegar al componente de detalles usando el ID
            navigate(`/shop/${item.name}`);
        } catch (error) {
            console.error("Error al guardar el ítem en localStorage:", error);
            showToast('No se pudo abrir los detalles del producto.', 'error');
        }
    };

    // Renderizado de la tarjeta con el visor 3D
    const renderItemCard = (item) => {
        const ItemIcon = item.icon; // Se mantiene el ícono para el fallback/referencia

        return (
            <div key={item.name} className={styles.itemCard}>
                <div className={styles.itemNameContainer}>
                    {/* Si el item ya está comprado, mostramos un overlay/badge */}
                    {item.isSelled && (
                        <div className={styles.soldBadge} title="Comprado">Comprado</div>
                    )}
                    <h4 className={styles.itemName} title={item.name}>{item.name}</h4>
                </div>

                <div className={styles.cardBody}>
                    <div className={styles.viewer3DContainer}>
                        <ModelViewer
                            modelPath={item.modelPath}
                            variant="default" // Usamos la vista frontal estática para la tarjeta
                        />
                    </div>
                    <div className={styles.itemInfo}>
                        <p className={styles.itemDescription}>{item.details}</p>
                        <div className={styles.infoRow}>
                            <label className={styles.infoLabel}>Categoría</label>
                            <p className={styles.infoValue}> {item.type}</p>
                        </div>
                        <div className={styles.infoRow}>
                            <label className={styles.infoLabel}>Mantenimiento</label>
                            <p className={styles.infoValue}> {item.maintenanceCost} €/mes</p>
                        </div>
                        <div className={styles.infoRow}>
                            <label className={styles.infoLabel}>Consumo</label>
                            <p className={styles.infoValue}> {item.estimatedConsumption} W</p>
                        </div>
                    </div>
                </div>

                {/* 3. Footer: Precio y Botón de Compra */}
                <div className={styles.itemFooter}>
                    <p className={styles.itemPrice}>${item.price.toFixed(2)}</p>
                    <Button
                        variant="primary"
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(item);
                        }}                    >
                        <Eye size={24} /> Ver
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1>Tienda</h1>
                <Button
                    variant="primary"
                    onClick={() => showToast('Explora y adquiere componentes para tus servidores y racks. Usa el buscador para filtrar por tipo, nombre o descripción.', 'info')}
                > <Info size={20} />
                </Button>
            </div>

            <div className={styles.headerContainer}>
                <SearchFilterBar
                    onSearchChange={setSearchTerm}
                    searchPlaceholder="Buscar servidores, CPUs, RAM o componentes..."
                />
                <div className={styles.actionButtons}>
                    <Button
                        variant="primary"
                        onClick={() => setIsFormOpen(true)}
                    >
                        <Plus size={20} />
                        Nuevo Componente
                    </Button>
                </div>


            </div>

            <div className={styles.itemsGrid}>
                {/* 3. Lógica de renderizado con estados de carga y error */}
                {loading ? (
                    <div className={styles.loadingState}>
                        <Loader2 size={40} className="animate-spin" />
                        <p>Cargando catálogo de productos...</p>
                    </div>
                ) : error ? (
                    <div className={styles.emptyState}>
                        <XCircle size={40} />
                        <p>{error}</p>
                        <p>Intenta recargar la página o revisa la consola para más detalles.</p>
                    </div>
                ) : filteredItems.length > 0 ? (
                    filteredItems.map(renderItemCard)
                ) : (
                    <div className={styles.emptyState}>
                        <Package size={48} className={styles.emptyIcon} />
                        <p>No se encontraron artículos que coincidan con "{searchTerm}".</p>
                    </div>
                )}
            </div>

            {/* NUEVO: Renderizado Condicional del Formulario */}
            <Dialog
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}>
                <NewComponentForm
                    onClose={() => setIsFormOpen(false)}
                    onSubmit={handleCreateComponent}
                />
            </Dialog>

        </div>

    );
};

export default ShopPage;
