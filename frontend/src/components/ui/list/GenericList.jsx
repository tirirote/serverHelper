import React from 'react';
import PropTypes from 'prop-types';
import { Package, ChevronDown, ChevronUp } from 'lucide-react';
import Tooltip from '../tooltip/Tooltip.jsx'; // Importamos el Tooltip
import styles from './GenericList.module.css';

/**
 * Componente genérico para renderizar una lista simple de ítems.
 * Muestra el campo 'name' de cada ítem y envuelve cada uno con un Tooltip 
 * que muestra los detalles completos del ítem (el objeto JSON).
 * * @param {string} title - Título de la lista (Ej: "Compatible con", "Puertos disponibles").
 * @param {Array<Object>} items - Lista de objetos a renderizar.
 */
const GenericList = ({ title, items }) => {
    // Estado para controlar si la lista está colapsada. Por defecto, colapsada (true).
    const [isCollapsed, setIsCollapsed] = React.useState(true);

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    if (!items || items.length === 0) {
        return (
            <div className={styles.listContainer}>
                <label className={styles.listTitle}>{title}</label>
                <div className={styles.emptyList}>
                    <Package size={20} className={styles.emptyIcon} />
                    <span>Sin ítems registrados.</span>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.listContainer}>

            <button
                onClick={toggleCollapse}
                className={styles.toggleButton}
                aria-expanded={!isCollapsed}
            >
                <label className={styles.listTitle}>{title} ({items.length})</label>
                {/* Icono de flecha que indica el estado actual */}
                {isCollapsed ? (
                    <ChevronDown size={18} />
                ) : (
                    <ChevronUp size={18} />
                )}
            </button>
            <div className={isCollapsed ? styles.listCollapsed : styles.list}>
                {items.map((item, index) => (
                    // 💡 Cada ítem se envuelve en el Tooltip
                    <Tooltip key={item.id || index} data={item} delay={500}>
                        <div className={styles.listItem}>
                            <span className={styles.itemName}>
                                {item.name}
                            </span>
                            {/* Opcional: mostrar un contador si existe */}
                            {item.count !== undefined && item.count !== null && (
                                <span className={styles.itemCount}>
                                    ({item.count})
                                </span>
                            )}
                        </div>
                    </Tooltip>
                ))}
            </div>
        </div>
    );
};

GenericList.propTypes = {
    title: PropTypes.string.isRequired,
    items: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), // Permitir ID opcional o string
        name: PropTypes.string.isRequired,
        count: PropTypes.number,
    })).isRequired,
};

export default GenericList;