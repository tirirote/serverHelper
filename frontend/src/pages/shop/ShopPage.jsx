import React, { useState, useMemo } from 'react';
import { ShoppingCart, Server, Package, Cpu, HardDrive, PlusCircle, MemoryStick } from 'lucide-react';
import { useToast } from '../../components/ui/toasts/ToastProvider.jsx';
import SearchFilterBar from '../../components/ui/searchbar/SearchFilterBar.jsx';
import Button from '../../components/ui/button/Button.jsx';
import ModelViewer from '../../components/3d/ModelViewer.jsx';
import ShopPageDetails from './ShopPageDetails.jsx';
import styles from './ShopPage.module.css';
import { useNavigate } from 'react-router-dom';

// MOCK DATA para artículos de la tienda
const initialShopItems = [
    // Se añade modelPath a cada item
    {
        id: 'i-101',
        name: 'Servidor Base R-10',
        category: 'Server',
        description: 'Servidor genérico de 1U, ideal para desarrollo.',
        price: 1200.00,
        icon: Server,
        maintenanceCost: 15.00,
        estimatedConsumption: 150,
        compatibleComponents: ['Rack 1U', 'Rack 2U'],
        modelPath: '/assets/models/server-closed.glb'
        
    }
];

const ShopPage = () => {
    const { showToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState([]);
    const navigate = useNavigate();

    // Lógica de filtrado de la tienda (sin cambios)
    const filteredItems = useMemo(() => {
        if (!searchTerm) {
            return initialShopItems;
        }
        const lowerCaseSearch = searchTerm.toLowerCase();
        return initialShopItems.filter(item =>
            item.name.toLowerCase().includes(lowerCaseSearch) ||
            item.description.toLowerCase().includes(lowerCaseSearch) ||
            item.category.toLowerCase().includes(lowerCaseSearch)
        );
    }, [searchTerm]);

    // Manejadores de carrito (sin cambios)
    const handleAddToCart = (item) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(i => i.id === item.id);
            if (existingItem) {
                return prevCart.map(i =>
                    i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
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
            navigate(`/shop/${item.id}`);
        } catch (error) {
            console.error("Error al guardar el ítem en localStorage:", error);
            showToast('No se pudo abrir los detalles del producto.', 'error');
        }
    };

    // Renderizado de la tarjeta con el visor 3D
    const renderItemCard = (item) => {
        const ItemIcon = item.icon; // Se mantiene el ícono para el fallback/referencia

        return (
            <div key={item.id} className={styles.itemCard}>

                {/* 1. Visor 3D: Ocupa la mayor parte del espacio visual */}
                <div className={styles.viewer3DContainer}>
                    <ModelViewer
                        modelPath={item.modelPath}
                        variant="default" // Usamos la vista frontal estática para la tarjeta
                    />
                </div>

                {/* 2. Información del Item */}
                <div className={styles.itemInfo}>
                    <div className={styles.itemNameContainer}>
                        <h3 className={styles.itemName} title={item.name}>{item.name}</h3>
                    </div>

                    <p className={styles.itemDescription}>{item.description}</p>

                    <div className={styles.itemMeta}>
                        <ItemIcon size={14} className={styles.metaIcon} />
                        <span className={styles.itemCategory}>{item.category}</span>
                    </div>
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
                        }}
                    >
                        <PlusCircle size={18} /> Ver Detalles
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <div className={styles.shopPage}>
            <header className={styles.header}>
                <h1 className={styles.title}>
                    <ShoppingCart size={28} style={{ marginRight: '10px' }} />
                    Tienda de Componentes
                </h1>
                <Button
                    variant="secondary"
                    onClick={handleCheckout}
                    disabled={totalItemsInCart === 0}
                    className={styles.cartButton}
                >
                    <ShoppingCart size={20} />
                    Carrito ({totalItemsInCart})
                </Button>
            </header>

            <div className={styles.searchBarContainer}>
                <SearchFilterBar
                    onSearchChange={setSearchTerm}
                    searchPlaceholder="Buscar servidores, CPUs, RAM o componentes..."
                />
            </div>

            <div className={styles.itemsGrid}>
                {filteredItems.length > 0 ? (
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
