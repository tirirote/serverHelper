import React, { useState, useMemo } from 'react';
import { ShoppingCart, Server, Package, Cpu, HardDrive, PlusCircle, MemoryStick } from 'lucide-react';
import { useToast } from '../../components/ui/toasts/ToastProvider.jsx';
import SearchFilterBar from '../../components/ui/searchbar/SearchFilterBar.jsx';
import Button from '../../components/ui/button/Button.jsx';
import styles from './ShopPage.module.css';

// MOCK DATA para artículos de la tienda
const initialShopItems = [
    { id: 'i-101', name: 'Servidor Base R-10', category: 'Server', description: 'Servidor genérico de 1U, ideal para desarrollo.', price: 1200.00, icon: Server, rating: 4.5 },
    { id: 'i-102', name: 'CPU Intel i9-14900K', category: 'Processor', description: 'Rendimiento extremo para cargas pesadas.', price: 599.99, icon: Cpu, rating: 4.8 },
    { id: 'i-103', name: 'RAM DDR5 32GB Kit', category: 'Memory', description: 'Memoria de alta velocidad para entornos virtualizados.', price: 150.50, icon: MemoryStick, rating: 4.2 },
    { id: 'i-104', name: 'SSD NVMe 2TB Pro', category: 'Storage', description: 'Almacenamiento ultrarrápido y fiable.', price: 299.00, icon: HardDrive, rating: 4.7 },
    { id: 'i-105', name: 'Servidor de Almacenamiento S-50', category: 'Server', description: 'Servidor 4U con gran capacidad de discos.', price: 2500.00, icon: Server, rating: 4.1 },
    { id: 'i-106', name: 'Tarjeta Gráfica RTX 5000', category: 'Component', description: 'Para tareas de renderizado y Machine Learning.', price: 950.00, icon: Package, rating: 4.9 },
    { id: 'i-107', name: 'Fuente de Poder 1000W', category: 'Component', description: 'Fuente de alimentación platino de alta eficiencia.', price: 180.00, icon: Package, rating: 4.4 },
];

const ShopPage = () => {
    const { showToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState([]);

    // Lógica de filtrado de la tienda
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

    const handleAddToCart = (item) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(i => i.id === item.id);
            if (existingItem) {
                // Si ya existe, incrementa la cantidad
                return prevCart.map(i => 
                    i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                );
            } else {
                // Si es nuevo, añade con cantidad 1
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
        // Simulación de proceso de compra
        showToast(`Simulando la compra de ${cart.length} artículos.`, 'info');
        setCart([]); // Vaciar el carrito
    };

    const totalItemsInCart = useMemo(() => 
        cart.reduce((sum, item) => sum + item.quantity, 0), [cart]
    );

    const renderItemCard = (item) => {
        const ItemIcon = item.icon;
        
        return (
            <div key={item.id} className={styles.itemCard}>
                <div className={styles.iconContainer}>
                    <ItemIcon size={40} className={styles.itemIcon} />
                </div>
                <h3 className={styles.itemName}>{item.name}</h3>
                <p className={styles.itemDescription}>{item.description}</p>
                
                <div className={styles.itemMeta}>
                    <span className={styles.itemCategory}>{item.category}</span>
                    <span className={styles.itemRating}>⭐ {item.rating.toFixed(1)}</span>
                </div>
                
                <div className={styles.itemFooter}>
                    <span className={styles.itemPrice}>${item.price.toFixed(2)}</span>
                    <Button 
                        variant="primary" 
                        size="small"
                        onClick={() => handleAddToCart(item)}
                    >
                        <PlusCircle size={18} /> Añadir
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
                    // No necesitamos un filtro avanzado por ahora, solo la barra
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

            {/* Simulación de un carrito flotante simple */}
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
