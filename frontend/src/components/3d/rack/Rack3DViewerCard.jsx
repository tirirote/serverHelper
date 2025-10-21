import React from 'react';
import { Server, Eye, Wifi, DollarSign } from 'lucide-react';
import styles from './Rack3DViewerCard.module.css';
import ModelViewer from '../ModelViewer';
// =========================================================================
// Mapeo de Modelos 3D por Estado de Salud
// NOTA: En una aplicación real, estas rutas apuntarían a tus assets 3D.
// Aquí se simulan las rutas condicionales.
// =========================================================================
const MODEL_PATHS = {
    Excellent: '/assets/models/rack-healthy.glb',
    Degraded: '/assets/models/rack-warning.glb',
    Failure: '/assets/models/rack-error.glb',
    Default: '/assets/models/rack-off.glb',
};

/**
 * Componente Card para la visualización abstracta de un Rack de servidores
 * con renderizado 3D usando @react-three/fiber y modelos condicionales.
 *
 * @param {object} props
 * @param {object} props.rack - Objeto con los datos del rack (id, name, servers, cost, health, power).
 * @param {function} props.onAction - Callback para manejar acciones (ej: ver detalles).
 */
const Rack3DViewerCard = ({ rack, onAction }) => {

    // 1. Selecciona la ruta del modelo basada en el estado de salud
    const selectedModelPath = MODEL_PATHS[rack.health] || MODEL_PATHS.Default;

    // Helper para determinar clases CSS del módulo basadas en el estado de salud
    const getHealthClasses = (health) => {
        switch (health) {
            case 'Excellent': return styles.healthExcellent;
            case 'Degraded': return styles.healthDegraded;
            case 'Failure': return styles.healthFailure;
            default: return styles.healthDefault;
        }
    };

    const powerStatusColor = rack.power === 'ON' ? styles.powerOn : styles.powerOff;
    const healthPillClasses = getHealthClasses(rack.health);
    const formatCurrency = (amount) => `$${amount.toFixed(2)}`;

    return (
        <div 
            className={styles.card} 
            onClick={() => onAction('view', rack.id)}
            role="button"
            tabIndex={0}
            aria-label={`Ver detalles del Rack ${rack.name}`}
        >
            
            {/* Nombre del Rack y Estado de Salud */}
            <div className={styles.header}>
                <h3 className={styles.title} title={rack.name}>
                    {rack.name}
                </h3>
                <span className={`${styles.healthPill} ${healthPillClasses}`}>
                    {rack.health}
                </span>
            </div>

            {/* Visor 3D: Contenedor para el Modelo de Rack Condicional */}
            <div className={styles.viewer}>
                {/* 2. Renderizado del Modelo 3D */}
                <ModelViewer 
                    modelPath={selectedModelPath}
                    variant="static" 
                    // El componente ModelViewer ya está configurado para mostrar la vista frontal
                />
            </div>
            
            {/* Métricas Clave */}
            <div className={styles.metricsGrid}>
                
                {/* Coste Total de Mantenimiento */}
                <div className={styles.metricItem}>
                    <span className={styles.metricLabel}>Costo</span>
                    <span className={styles.metricValue}>{formatCurrency(rack.cost)} / mes</span>
                </div>
                
                {/* Power Status */}
                <div className={styles.metricItem}>
                    <span className={styles.metricLabel}>Status</span>
                    <span className={`${styles.metricValue} ${powerStatusColor}`}>{rack.power}</span>
                </div>
            </div>
        </div>
    );
};

export default Rack3DViewerCard;
