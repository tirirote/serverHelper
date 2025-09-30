// src/components/ui/gallery/ComponentGallery.jsx
import React from 'react';
import PropTypes from 'prop-types';
import GalleryItem from './GalleryItem.jsx';
import styles from './ComponentGallery.module.css';

/**
 * Contenedor de la galería que distribuye los componentes en una cuadrícula.
 * @param {Array<Object>} items - Array de objetos componentes.
 * @param {function} onItemSelected - Callback cuando se selecciona un item para la acción principal.
 */
const ComponentGallery = ({ items, onItemSelected }) => {
    return (
        <div className={styles.galleryContainer}>
            {items.length > 0 ? (
                items.map(item => (
                    <GalleryItem 
                        key={item.id}
                        item={item}
                        onSelect={onItemSelected}
                    />
                ))
            ) : (
                <div className={styles.emptyState}>
                    No se encontraron componentes.
                </div>
            )}
        </div>
    );
};

ComponentGallery.propTypes = {
    items: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    })).isRequired,
    onItemSelected: PropTypes.func.isRequired,
};

export default ComponentGallery;