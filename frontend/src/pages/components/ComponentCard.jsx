import React from 'react';
import { Cpu, Server, HardDrive, Zap, Package } from 'lucide-react';
import Button from '../../components/ui/button/Button.jsx';
import ModelViewer from '../../components/3d/ModelViewer.jsx';
import CompatibilityList from '../../components/form/component/CompatibilityList.jsx';

import styles from './MyComponents.module.css';

const ComponentCard = ({ component }) => {
    if (!component) {
        return (
            <div className={styles.componentCardPlaceholder}>
                <Package size={48} className="text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700">Selecciona un Componente</h3>
                <p className="text-gray-500">Haz clic en "Ver 3D" o en el nombre de la tabla para visualizarlo.</p>
            </div>
        );
    }

    return (
        <div className={styles.componentCard}>
            <div className={styles.visualizer}>
                <h2 className={styles.visualizerTitle}>{component.name}</h2>
                <div>
                    <ModelViewer
                        modelPath={component.modelPath}
                        variant="default"
                    />
                </div>
            </div>

            <div className={styles.details}>
                <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Descripción</span>
                    <span className={styles.detailValue}>{component.description}</span>
                </div>

                <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Tipo</span>
                    <span className={styles.detailValue}>{component.category}</span>
                </div>

                <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Consumo Estimado</span>
                    <span className={styles.detailValue}>{component.estimatedConsumption}</span>
                </div>
                <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Coste de Mantenimiento</span>
                    <span className={styles.detailValue}>{component.maintenanceCost}</span>
                </div>

                <div className={styles.compatibilityHeader}>
                    <CompatibilityList items={component.compatibleWith} />
                </div>

                <div className={styles.cardFooter} />
            </div>
        </div>
    );
};

export default ComponentCard;