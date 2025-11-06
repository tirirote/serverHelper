import React, { useState, useMemo } from 'react';
import { ArrowLeft, PlusCircle, Wifi, DollarSign, Zap, List } from 'lucide-react';
import ModelViewer from '../../components/3d/ModelViewer.jsx';
import Button from '../../components/ui/button/Button.jsx';
import styles from './ShopPageDetails.module.css';
import { useParams, useNavigate } from 'react-router-dom';

const ShopPageDetails = ({ onAddToCart }) => {

    const { itemId } = useParams();
    const navigate = useNavigate();

    // Estado local para la cantidad
    const [quantity, setQuantity] = useState(1);

    // Lectura y verificación del ítem en localStorage
    const item = useMemo(() => {
        const storedData = localStorage.getItem('selectedShopItemData');
        if (!storedData) {
            console.error("Error: 'selectedShopItemData' no se encontró en localStorage.");
            return null;
        }
        
        try {
            const parsedItem = JSON.parse(storedData);
            // Crucial: Solo retorna el ítem si su ID coincide con el ID del URL.
            // Esto evita que se muestre el ítem incorrecto si el usuario navega a otro ID sin pasar por la lista.
            if (parsedItem && parsedItem.id === itemId) {
                return parsedItem;
            }
            console.warn(`Error de coincidencia: ID del URL (${itemId}) no coincide con ID almacenado (${parsedItem.id}).`);
            return null;
        } catch (e) {
            console.error("Error al parsear JSON desde localStorage:", e);
            return null;
        }
    }, [itemId]);


    if (!item) {
        // Manejo de Error 404 (Item no encontrado en localStorage o ID no coincide)
        return (
            <div className={styles.detailsPage} style={{ padding: '32px', color: '#f9fafb', backgroundColor: '#111827' }}>
                <Button variant="secondary" onClick={() => navigate('/')} className="mb-5">
                    <ArrowLeft size={20} style={{ marginRight: '10px' }} /> Volver a la Tienda
                </Button>
                <h2 style={{ fontSize: '2rem', color: '#ef4444' }}>Error 404: Producto no encontrado</h2>
                <p style={{ color: '#9ca3af' }}>El ítem con ID **{itemId}** no pudo ser cargado (Puede que se haya perdido el dato de `localStorage` o el URL es inválido).</p>
            </div>
        );
    }

    const handleAdd = () => {
        onAddToCart(item, quantity);
    };

    const formatCurrency = (amount) => `$${(amount || 0).toFixed(2)}`;
    
    const compatibleList = item.compatibleComponents || item.compatibleWith || [];

    return (
        <div className={styles.detailsPage}>


            <div className={styles.productContainer}>

                {/* Columna Izquierda: Visor 3D */}
                <div className={styles.viewerColumn}>
                    <h2 className={styles.productName}>{item.name}</h2>
                    <div className={styles.viewerLgContainer}>
                        <ModelViewer
                            modelPath={item.modelPath}
                            variant="default" // Usamos el modo default (interactivo)
                            customScale={item.scale} // Aplicamos la escala del modelo
                        />
                    </div>
                    <p className={styles.viewerTip}>
                        * Usa el ratón para rotar y hacer zoom en el modelo 3D.
                    </p>
                </div>

                {/* Columna Derecha: Información del Producto */}
                <div className={styles.infoColumn}>

                    <div className={styles.priceContainer}>
                        <span className={styles.priceTag}>{formatCurrency(item.price)}</span>
                    </div>

                    <p className={styles.description}>{item.description}</p>

                    {/* Metadatos y Especificaciones */}
                    <div className={styles.specsGrid}>
                        <div className={styles.specItem}>
                            <DollarSign size={20} className={styles.specIcon} />
                            <span className={styles.specLabel}>Costo Mantenimiento/Mes:</span>
                            <span className={styles.specValue}>{formatCurrency(item.maintenanceCost)}</span>
                        </div>

                        <div className={styles.specItem}>
                            <Zap size={20} className={styles.specIcon} />
                            <span className={styles.specLabel}>Consumo Estimado:</span>
                            <span className={styles.specValue}>{item.estimatedConsumption}</span>
                        </div>

                        <div className={styles.specItem}>
                            <List size={20} className={styles.specIcon} />
                            <span className={styles.specLabel}>Categoría:</span>
                            <span className={styles.specValue}>{item.category}</span>
                        </div>
                    </div>

                    {/* Compatibilidad */}
                    <h3 className={styles.sectionTitle}>Componentes Compatibles</h3>
                    <ul className={styles.compatibilityList}>
                        {item.compatibleComponents.map((comp, index) => (
                            <li key={index} className={styles.compatibilityItem}>
                                {comp}
                            </li>
                        ))}
                    </ul>

                    {/* Control de Cantidad y Botón de Compra */}
                    <div className={styles.purchaseControls}>
                        <div className={styles.quantityControl}>
                            <label htmlFor="quantity" className={styles.quantityLabel}>Cantidad:</label>
                            <input
                                id="quantity"
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                className={styles.quantityInput}
                            />
                        </div>

                        <Button
                            variant="success"
                            size="large"
                            onClick={handleAdd}
                            className={styles.addToCartButton}
                        >
                            <PlusCircle size={24} />
                            Añadir al Carrito ({quantity})
                        </Button>
                    </div>

                </div>
            </div>
            
            {/* Botón de Regreso */}
            <div className={styles.backButtonContainer}>
                <Button variant="secondary" size="medium">
                    <ArrowLeft size={20} /> Volver a la Tienda
                </Button>
            </div>
        </div>
    );
};

export default ShopPageDetails;