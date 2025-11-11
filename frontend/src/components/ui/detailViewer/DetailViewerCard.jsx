import React from 'react';
import { Cpu, Server, MapPin, HardDrive, Package, DollarSign, Zap, Warehouse } from 'lucide-react';
import styles from './DetailViewerCard.module.css'; 
import Button from '../button/Button.jsx'
import ModelViewer from '../../3d/ModelViewer.jsx'

// Helper para determinar el tipo de ítem y metadatos (puede expandirse con más tipos)
const getItemMetadata = (item) => {
    if (item.os && item.region) {
        return { type: 'server', icon: Server, title: 'Servidor Cloud' };
    }
    if (item.category && item.maintenanceCost !== undefined) {
        return { type: 'component', icon: Package, title: 'Componente de Hardware' };
    }
    if (item.maxCapacityU !== undefined) {
        return { type: 'rack', icon: Warehouse, title: 'Rack de Servidores' };
    }
    return { type: 'unknown', icon: Package, title: 'Detalle Genérico' };
};

// Mapa de campos de detalle para renderizar dinámicamente
const DetailMapping = {
    server: [
        { label: 'Sistema Operativo', key: 'os', icon: Cpu },
        { label: 'Región', key: 'region', icon: MapPin },
        { label: 'Especificaciones', key: ['cpu', 'ram'], format: (item) => `${item.cpu} / ${item.ram}` },
        { label: 'Estado', key: 'status', status: true },
        { label: 'ID Instancia', key: 'id', small: true },
    ],
    component: [
        { label: 'Categoría', key: 'category', icon: Package },
        { label: 'Precio Unitario', key: 'price', format: (v) => `${v.toFixed(2)} €`, icon: DollarSign },
        { label: 'Costo Mantenimiento', key: 'maintenanceCost', format: (v) => `${v.toFixed(2)} €/Mes` },
        { label: 'Consumo Estimado', key: 'estimatedConsumption', format: (v) => `${v} W`, icon: Zap },
        { label: 'ID Componente', key: 'id', small: true },
    ],
    rack: [
        { label: 'Capacidad Máxima (U)', key: 'maxCapacityU' },
        { label: 'Uso Actual (U)', key: 'currentUsageU' },
        { label: 'Ubicación Física', key: 'location', icon: MapPin },
        { label: 'Tipo de Energía', key: 'powerType' },
        { label: 'ID Rack', key: 'id', small: true },
    ],
};

const getStatusClass = (status) => {
    switch (status) {
        case 'Running':
        case 'Online': return styles.statusRunning;
        case 'Stopped':
        case 'Offline': return styles.statusStopped;
        case 'Starting':
        case 'Pending': return styles.statusStarting;
        default: return '';
    }
};

/**
 * Componente dinámico para visualizar detalles de cualquier tipo de ítem (Servidor, Componente, Rack, etc.)
 * Renderiza el modelo 3D y los campos de detalle basándose en la configuración de DetailMapping.
 */
const DetailViewerCard = ({ item }) => {
    // Si no se pasa un ítem, muestra el placeholder.
    if (!item) {
        return (
            <div className={styles.viewerCardPlaceholder}>
                <Package size={48} className="text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700">Selecciona un Ítem</h3>
                <p className="text-gray-500">Haz clic en el nombre o en "Ver Detalles" en la tabla para visualizarlo.</p>
            </div>
        );
    }
    
    const displayItem = item; 
    const { type, icon: ItemIcon, title: itemTitle } = getItemMetadata(displayItem);

    if (type === 'unknown') {
        return (
             <div className={styles.viewerCardPlaceholder}>
                <Package size={48} className="text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700">Tipo de Ítem Desconocido</h3>
                <p className="text-gray-500">No se pudo determinar el esquema de detalles para este objeto.</p>
            </div>
        );
    }
    
    const detailsToShow = DetailMapping[type] || [];
    const hasCompatibility = displayItem.compatibleWith && displayItem.compatibleWith.length > 0;

    return (
        <div className={styles.viewerCard}>
            <div className={styles.visualizer}>
                <h2 className={styles.visualizerTitle}>{displayItem.name}</h2>
                
                {/* Visualizador 3D (Mocked) */}
                <ModelViewer
                    modelPath={displayItem.modelPath}
                    variant={type}
                />
            </div>
            
            <div className={styles.details}>
                <div className={styles.descriptionSection}>
                    <span className={styles.detailLabel}>Descripción</span>
                    <p>{displayItem.description || 'Sin descripción detallada.'}</p>
                </div>
                
                <div className={styles.detailsGrid}>
                    {detailsToShow.map((detail, index) => {
                        // 1. Obtiene el valor
                        const rawValue = Array.isArray(detail.key) 
                            ? detail.key.map(k => displayItem[k]).join(' / ') 
                            : displayItem[detail.key];
                            
                        // 2. Aplica formato si existe
                        const value = detail.format 
                            ? detail.format(displayItem[detail.key] || rawValue) 
                            : rawValue;

                        if (value === undefined || value === null) return null;

                        // 3. Define el componente de valor con estilos de estado
                        const ValueComponent = detail.status ? (
                            <span className={`${styles.detailValue} ${getStatusClass(value)}`}>{value}</span>
                        ) : (
                            <span className={`${styles.detailValue} ${detail.small ? styles.detailValueSmall : ''}`}>{value}</span>
                        );
                        
                        return (
                            <div key={index} className={styles.detailRow}>
                                <span className={styles.detailLabel}>
                                    {detail.label}
                                </span>
                                {ValueComponent}
                            </div>
                        );
                    })}
                </div>

                {/* Sección Condicional de Compatibilidad */}
                {(type === 'component' || type === 'rack') && hasCompatibility && (
                    <div className={styles.compatibilitySection}>
                        <CompatibilityList items={displayItem.compatibleWith} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default DetailViewerCard;