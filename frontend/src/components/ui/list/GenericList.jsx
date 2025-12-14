import React from 'react';
import PropTypes from 'prop-types';
import { Package, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import Tooltip from '../tooltip/Tooltip.jsx'; // Importamos el Tooltip
import styles from './GenericList.module.css';

/**
 * Componente genérico para renderizar una lista simple de ítems.
 * Muestra el campo 'name' de cada ítem y envuelve cada uno con un Tooltip 
 * que muestra los detalles completos del ítem (el objeto JSON).
 * * @param {string} title - Título de la lista (Ej: "Compatible con", "Puertos disponibles").
 * @param {Array<Object>} items - Lista de objetos a renderizar.
 */
const GenericList = ({ title, items, onRemoveItem }) => {
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
                    <p>Sin ítems registrados.</p>
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
                type='button'
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
                {items.map((item) => (
                    <div className={styles.listItem}>
                        <div className={styles.itemNameContainer}>
                            <label className={styles.itemName}>{item.name}</label>
                            {/* Opcional: mostrar un contador si existe */}
                            {item.count !== undefined && item.count !== null && (
                                <span className={styles.itemCount}>
                                    ({item.count})
                                </span>
                            )}
                        </div>

                        {/* Botón de Eliminación: Agregado para cumplir con la funcionalidad de asignación/eliminación */}
                        {onRemoveItem && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation(); // Previene la activación del Tooltip al hacer clic
                                    onRemoveItem(item.id);
                                }}
                                className={styles.removeButton}
                                aria-label={`Eliminar ${item.name}`}
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>
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
    onRemoveItem: PropTypes.func
};

export default GenericList;