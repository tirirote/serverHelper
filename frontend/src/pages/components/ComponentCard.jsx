import React from 'react';
import { Cpu, Server, HardDrive, Zap, Package } from 'lucide-react';
import Button from '../../components/ui/button/Button.jsx';
import ModelViewer from '../../components/3d/ModelViewer.jsx';

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
                <h2 className={styles.visualizerTitle}>Visualización 3D: {component.name}</h2>
                <div>
                    <ModelViewer
                        modelPath={component.modelPath}
                        variant="default"
                    />
                </div>
            </div>

            <div className={styles.details}>
                <h3 className={styles.detailsTitle}>{component.name}</h3>

                <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>ID Serial:</span>
                    <span className={styles.detailValue}>{component.serial}</span>
                </div>
                <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Proveedor:</span>
                    <span className={styles.detailValue}>{component.vendor}</span>
                </div>
                <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Tipo:</span>
                    <span className={styles.detailValue}>{component.type}</span>
                </div>
                <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Uso Principal:</span>
                    <span className={styles.detailValue}>{component.usage}</span>
                </div>
                <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Estado:</span>
                    <span className={`${styles.detailValue} ${component.status === 'Active' ? 'text-green-600 font-bold' : 'text-yellow-600 font-bold'}`}>
                        {component.status}
                    </span>
                </div>

                <div className={styles.cardFooter}>
                    <Button variant="secondary" size="small" onClick={() => alert(`Simulando test para ${component.name}`)}>
                        Ejecutar Test
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ComponentCard;