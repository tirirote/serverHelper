import React, { useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import styles from './Tooltip.module.css';
import ModelViewer from '../../3d/ModelViewer.jsx'; 

/**
 * Componente Tooltip que se muestra tras un retardo (delay) al hacer hover.
 * Muestra el objeto JSON completo (data) del elemento subyacente.
 * * @param {Object} data - El objeto JSON a mostrar en el tooltip.
 * @param {number} delay - El tiempo en milisegundos que debe esperar antes de mostrarse.
 * @param {React.ReactNode} children - El elemento que activa el tooltip.
 */
const Tooltip = ({ data, content, delay = 300, children }) => {
    const [isVisible, setIsVisible] = useState(false);
    const timerRef = useRef(null);

    // Lógica para mostrar el tooltip con retardo
    const handleMouseEnter = useCallback(() => {
        timerRef.current = setTimeout(() => {
            setIsVisible(true);
        }, delay);
    }, [delay]);

    // Lógica para ocultar inmediatamente y limpiar el temporizador
    const handleMouseLeave = useCallback(() => {
        clearTimeout(timerRef.current);
        setIsVisible(false);
    }, []);

    // Formatea el objeto JSON para mostrarlo de forma legible en el tooltip
    // Formatea el objeto JSON para mostrarlo de forma legible en el tooltip
    const renderData = () => {
        // Si hay 'content', se muestra directamente
        if (content) {
            return <div className={styles.tooltipContentText}>{content}</div>;
        }

        // Si no hay 'content', procede a renderizar el objeto 'data'
        if (!data || Object.keys(data).length === 0) {
            return <p className={styles.tooltipNoData}>No hay detalles disponibles.</p>;
        }

        const hasModelViewer = data.modelPath;

        // Excluir claves internas (como las usadas para el componente padre)
        const displayData = { ...data };
        delete displayData.id;
        delete displayData.name;
        delete displayData.count;
        delete displayData.modelPath; // 💡 Excluimos modelPath de la lista de detalles


        // Convertir el objeto a pares clave-valor
        const entries = Object.entries(displayData);

        return (
            <div className={styles.tooltipBox}>
                
                {data.name && (<h4 className={styles.tooltipTitle}>{data.name}</h4>)}
                
                {/* 💡 RENDERIZADO CONDICIONAL DE MODELVIEWER */}
                {hasModelViewer && (
                    <div className={styles.tooltipModelViewerContainer}>
                        <ModelViewer
                            modelPath={data.modelPath}
                            // Usamos el nombre del ítem como variante/título para el modelo
                            variant='default'
                        />
                    </div>
                )}

                <div className={styles.tooltipContent}>
                    {entries.length > 0 ? (
                        entries.map(([key, value]) => (
                            <div key={key} className={styles.tooltipRow}>
                                <span className={styles.tooltipKey}>{key}:</span>
                                <span className={styles.tooltipValue}>
                                    {
                                        // Muestra objetos y arrays como JSON string, valores simples directamente
                                        typeof value === 'object' && value !== null
                                            ? JSON.stringify(value).substring(0, 50) + '...'
                                            : String(value)
                                    }
                                </span>
                            </div>
                        ))
                    ) : (
                        // Si hay 'data.name' pero no otros campos, mostramos este mensaje.
                        <p className={styles.tooltipNoData}>No hay detalles adicionales.</p>
                    )}
                </div>
            </div>

        );
    };

    return (
        <div
            className={styles.tooltipWrapper}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {children}
            {isVisible && (renderData())}
        </div>
    );
};

Tooltip.propTypes = {
    data: PropTypes.object, // Ahora opcional
    content: PropTypes.string, // Nueva prop opcional
    delay: PropTypes.number,
    children: PropTypes.node.isRequired,
};

export default Tooltip;