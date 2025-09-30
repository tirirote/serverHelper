import React, { Suspense } from 'react';
import PropTypes from 'prop-types';
import styles from './ComponentGallery.module.css';
import ModelViewer from '../../3d/ModelViewer.jsx'; // Asegúrate de que la ruta es correcta
/**
 * Celda individual de la galería para un componente.
 * @param {Object} item - El objeto componente (ej: {id: 'c-1', name: 'CPU Intel i9', modelUrl: '...'}).
 * @param {function} onSelect - Función llamada al hacer click en el item (para navegar/comprar).
 */
const GalleryItem = ({ item, onSelect }) => {

    const handleClick = () => {
        if (onSelect) {
            // Pasamos el ID del item para saber qué comprar
            onSelect(item.id);
        }
    };

    return (
        <div
            className={styles.galleryItem}
            onClick={handleClick}
            role="button"
            tabIndex={0}
            aria-label={`Ver y comprar ${item.name}`}
        >
            {/* Contenedor del Visor 3D */}
            <div className={styles.modelViewer}>
                <ModelViewer modelPath={item.modelPath} />
            </div>

            {/* Título */}
            <h3 className={styles.itemTitle}>
                {item.name}
            </h3>
        </div>
    );
};

GalleryItem.propTypes = {
    item: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        name: PropTypes.string.isRequired,
        modelPath: PropTypes.string,
    }).isRequired,
    onSelect: PropTypes.func.isRequired,
};

export default GalleryItem;