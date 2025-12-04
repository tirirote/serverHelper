import React, { useState, useMemo } from 'react';
import { ArrowLeft, PlusCircle, Wifi, DollarSign, Zap, List, ChevronsLeftIcon, ChevronLeft, Plus } from 'lucide-react';
import { useToast } from '../../components/ui/toasts/ToastProvider.jsx';
import ModelViewer from '../../components/3d/ModelViewer.jsx';
import Button from '../../components/ui/button/Button.jsx';
import styles from './ShopPageDetails.module.css';
import CompatibilityList from '../../components/form/component/CompatibilityList.jsx';
import GenericList from '../../components/ui/list/GenericList.jsx'
import NumberSelector from '../../components/ui/numberSelector/NumberSelector.jsx';
import { useParams, useNavigate } from 'react-router-dom';
import { updateComponent } from '../../api/services/componentService.js';

const ShopPageDetails = ({ onAddToCart }) => {

    const { itemName } = useParams();
    const navigate = useNavigate();

    // Estado local para la cantidad
    const [quantity, setQuantity] = useState(1);

    const { showToast } = useToast();

    // Lectura y verificación del ítem en localStorage
    const item = useMemo(() => {
        const storedData = localStorage.getItem('selectedShopItemData');
        if (!storedData) {
            console.error("Error: 'selectedShopItemData' no se encontró en localStorage.");
            return null;
        }

        try {
            const parsedItem = JSON.parse(storedData);
            if (parsedItem && parsedItem.name === itemName) {
                return parsedItem;
            }
            console.warn(`Error de coincidencia: ID del URL (${itemName}) no coincide con Nombre almacenado (${parsedItem.name}).`);
            return null;
        } catch (e) {
            console.error("Error al parsear JSON desde localStorage:", e);
            return null;
        }
    }, [itemName]);


    if (!item) {
        // Manejo de Error 404 (Item no encontrado en localStorage o ID no coincide)
        return (
            <div className={styles.detailsPage} style={{ padding: '32px', color: '#f9fafb', backgroundColor: '#111827' }}>
                <Button variant="secondary" onClick={() => navigate('/')} className="mb-5">
                    <ArrowLeft size={24} style={{ marginRight: '10px' }} /> Volver a la Tienda
                </Button>
                <h2 style={{ fontSize: '2rem', color: '#ef4444' }}>Error 404: Producto no encontrado</h2>
                <p style={{ color: '#9ca3af' }}>El ítem con ID **{itemName}** no pudo ser cargado (Puede que se haya perdido el dato de `localStorage` o el URL es inválido).</p>
            </div>
        );
    }

    const handleAdd = async () => {
        // Si el componente ya está marcado como comprado, no permitir añadir/comprar otra vez
        if (item?.isSelled) {
            showToast('Este componente ya ha sido comprado.', 'info');
            return;
        }
        // Si la página se usa en la tienda (con onAddToCart), delegamos en esa función para mantener el carrito.
        if (typeof onAddToCart === 'function') {
            onAddToCart(item, quantity);
            return;
        }

        // Si no se pasa onAddToCart (por ejemplo, la página se accede directamente), consideramos esto como "Compra directa".
        try {
            // Llama a API para marcar el componente como vendido
            await updateComponent(item.name, { ...item, isSelled: true });
            showToast(`Compra realizada: ${item.name}`, 'success');
            // Navegar a la lista de componentes comprados
            navigate('/dashboard');
        } catch (err) {
            console.error('Error actualizando el componente después de la compra:', err);
            showToast('No se pudo completar la compra. Inténtalo de nuevo.', 'error');
        }
    };

    const formatCurrency = (amount) => `${(amount || 0).toFixed(2)} €`;

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div className={styles.actionButtons}>
                    <Button
                        variant="primary"
                        size="medium"
                        onClick={() => navigate('/shop')}>
                        <ChevronLeft size={24} /> Volver
                    </Button>
                </div>
            </div>

            <div className={styles.productCard}>

                <div className={styles.productInfo}>

                    <div className={styles.viewerContainer}>
                        <ModelViewer modelPath={item.modelPath} variant="default" />
                    </div>

                    <div className={styles.infoSection}>

                        <div className={styles.productNameHeader}>
                            <h1 className={styles.productName}>{item.name}</h1>
                            <span className={styles.priceTag}>{formatCurrency(item.price)}</span>
                        </div>

                        <div className={styles.descriptionCard}>
                            <label>Descripción</label>
                            <p>{item.details}</p>
                        </div>

                        <div className={styles.infoList}>
                            <div className={styles.infoCard}>
                                <label className={styles.infoLabel}>Tipo de Componente</label>
                                <span className={styles.infoValue}>{item.type}</span>
                            </div>
                            <div className={styles.infoCard}>
                                <label className={styles.infoLabel}>Coste de Mantenimiento</label>
                                <span className={styles.infoValue}>{formatCurrency(item.maintenanceCost)}/mes</span>
                            </div>
                            <div className={styles.infoCard}>
                                <label className={styles.infoLabel}>Consumo Estimado</label>
                                <span className={styles.infoValue}>{item.estimatedConsumption}W /mes</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.purchaseCard}>
                    <h2 className={styles.purchaseHeader} >Compra</h2>
                    <div className={styles.purchaseBody}>
                        <NumberSelector
                            value={quantity}
                            min={1}
                            max={1}
                            onChange={(e) => setQuantity(e)}
                            unit=''
                            title='Cantidad'
                        />
                        <Button
                            variant={item.isSelled ? 'secondary' : 'primary'}
                            onClick={handleAdd}
                            disabled={item.isSelled}
                        >
                            <Plus size={24} />
                            {item.isSelled ? 'Comprado' : `Añadir (${quantity})`}
                        </Button>
                    </div>
                </div>
            </div>


        </div>
    );
};

export default ShopPageDetails;