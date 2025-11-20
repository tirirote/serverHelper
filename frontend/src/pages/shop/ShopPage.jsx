import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { ShoppingCart, Server, Package, Cpu, HardDrive, PlusCircle, MemoryStick, Eye, Loader2 } from 'lucide-react';
import { useToast } from '../../components/ui/toasts/ToastProvider.jsx';
import SearchFilterBar from '../../components/ui/searchbar/SearchFilterBar.jsx';
import Button from '../../components/ui/button/Button.jsx';
import ModelViewer from '../../components/3d/ModelViewer.jsx';
import ShopPageDetails from './ShopPageDetails.jsx';
import styles from './ShopPage.module.css';
import { useNavigate } from 'react-router-dom';

// API Services
import { getAllComponents } from '../../api/services/componentService.js'; // Importar la función de la API

const ShopPage = () => {
    const { showToast } = useToast();
    const navigate = useNavigate();

    // NUEVOS ESTADOS para manejar datos y carga
    const [shopItems, setShopItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState([]);

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
            item.description.toLowerCase().includes(lowerCaseSearch) ||
            item.category.toLowerCase().includes(lowerCaseSearch)
        );
    }, [shopItems, searchTerm]);

    // Manejadores de carrito
    const handleAddToCart = (item) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(i => i.name === item.name);
            if (existingItem) {
                return prevCart.map(i =>
                    i.name === item.name ? { ...i, quantity: i.quantity + 1 } : i
                );
            } else {
                return [...prevCart, { ...item, quantity: 1 }];
            }
        });
        showToast(`Añadido ${item.name} al carrito.`, 'success');
    };

    const handleCheckout = () => {
        if (cart.length === 0) {
            showToast('El carrito está vacío.', 'warning');
            return;
        }
        showToast(`Simulando la compra de ${cart.length} artículos.`, 'info');
        setCart([]); // Vaciar el carrito
    };

    const totalItemsInCart = useMemo(() =>
        cart.reduce((sum, item) => sum + item.quantity, 0), [cart]
    );

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
                    <h4 className={styles.itemName} title={item.name}>{item.name}</h4>
                    <span className={styles.itemCategory}>{item.type}</span>
                </div>
                {/* 1. Visor 3D: Ocupa la mayor parte del espacio visual */}
                <div className={styles.viewer3DContainer}>
                    <ModelViewer
                        modelPath={item.modelPath}
                        variant="default" // Usamos la vista frontal estática para la tarjeta
                    />
                </div>

                {/* 2. Información del Item */}
                <div className={styles.itemInfo}>
                    <p className={styles.itemDescription}>{item.details}</p>
                </div>

                {/* 3. Footer: Precio y Botón de Compra */}
                <div className={styles.itemFooter}>
                    <span className={styles.itemPrice}>${item.price.toFixed(2)}</span>
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
        <div>
            <header>
                <h1>Tienda</h1>
            </header>

            <div className={styles.headerContainer}>
                <SearchFilterBar
                    onSearchChange={setSearchTerm}
                    searchPlaceholder="Buscar servidores, CPUs, RAM o componentes..."
                />
                <Button
                    variant="icon-only"
                    onClick={handleCheckout}
                    disabled={totalItemsInCart === 0}
                    className={styles.cartButton}
                >
                    <ShoppingCart size={20} />
                    {totalItemsInCart}
                </Button>
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

            {/* Simulación de un carrito flotante simple (sin cambios) */}
            {cart.length > 0 && (
                <div className={styles.floatingCart}>
                    <p>🛒 Carrito: {totalItemsInCart} artículos</p>
                    <Button variant="success" size="small" onClick={handleCheckout}>
                        Pagar
                    </Button>
                </div>
            )}
        </div>
    );
};

export default ShopPage;
