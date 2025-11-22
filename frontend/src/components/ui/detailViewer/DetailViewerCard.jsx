import React from 'react';
import { Cpu, Server, MapPin, HardDrive, Package, DollarSign, Zap, Warehouse } from 'lucide-react';
import styles from './DetailViewerCard.module.css';
import Button from '../button/Button.jsx'
import CompatibilityList from '../../form/component/CompatibilityList.jsx';
import ModelViewer from '../../3d/ModelViewer.jsx'
import GenericList from '../../ui/list/GenericList.jsx'


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
const DetailViewerCard = ({
    name,
    description,
    modelPath,
    details,
    type,
    compatibilityItems
}) => {
    // Si no se pasa un ítem, muestra el placeholder.
    if (!name) {
        return (
            <div className={styles.viewerCardPlaceholder}>
                <Package size={48} className="text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700">Selecciona un Ítem</h3>
                <p className="text-gray-500">Haz clic en el nombre o en "Ver Detalles" en la tabla para visualizarlo.</p>
            </div>
        );
    }
    const hasCompatibility = Array.isArray(compatibilityItems) && compatibilityItems.length > 0;

    if (type === 'unknown') {
        return (
            <div className={styles.viewerCardPlaceholder}>
                <Package size={48} className="text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700">Tipo de Ítem Desconocido</h3>
                <p className="text-gray-500">No se pudo determinar el esquema de detalles para este objeto.</p>
            </div>
        );
    }

    return (
        <div className={styles.viewerCard}>
            <h1 className={styles.visualizerHeader}>{name}</h1>
            <div className={styles.visualizerContainer}>

                {/* Visualizador 3D (Mocked) */}
                <ModelViewer
                    modelPath={modelPath}
                    variant='default'
                    type={type}
                />
            </div>

            <div className={styles.detailsContainer}>

                <h2 className={styles.detailsHeader}>Detalles</h2>

                <div className={styles.detailsContent}>

                    <div className={styles.descriptionSection}>
                        <label className={styles.detailLabel}>Descripción</label>
                        <p className={styles.description}>{description || 'Sin descripción detallada.'}</p>
                    </div>

                    <div className={styles.detailsList}>
                        {/* 🚀 ITERACIÓN SIMPLIFICADA SOBRE EL ESQUEMA LISTO */}
                        {details.map((detail, index) => {
                            const { label, value, isStatus, isList, items } = detail;

                            // 1. Manejo de Listas
                            if (isList && Array.isArray(items)) {
                                if (items.length === 0) return null;

                                return (
                                    <div key={index} className={styles.detailList}>
                                        <GenericList
                                            title={label}
                                            items={items}
                                        />
                                    </div>
                                );
                            }

                            // 2. Manejo de Valor Simple (ya formateado si era necesario)
                            if (value === undefined || value === null) return null;

                            // 3. Define el componente de valor con estilos de estado
                            const ValueComponent = isStatus ? (
                                <span className={`${styles.detailValue} ${getStatusClass(value)}`}>{value}</span>
                            ) : (
                                <span className={`${styles.detailValue}`}>{value}</span>
                            );

                            return (
                                <div key={index} className={styles.detailRow}>
                                    <span className={styles.detailLabel}>
                                        {label}
                                    </span>
                                    {ValueComponent}
                                </div>
                            );
                        })}
                    </div>
                </div>
                {/* Sección Condicional de Compatibilidad */}
                {(type === 'component' || type === 'rack') && hasCompatibility && (
                    <div className={styles.compatibilitySection}>
                        <CompatibilityList items={compatibilityItems} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default DetailViewerCard;