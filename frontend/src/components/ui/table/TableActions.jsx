// src/components/ui/table/TableActions.jsx
import React from 'react';
import PropTypes from 'prop-types';
import Button from '../button/Button.jsx'; // Asegúrate de la ruta correcta
import { Eye, Trash2 } from 'lucide-react'; 
import styles from './TableActions.module.css'; // Usaremos un CSS module simple

/**
 * Componente que agrupa las acciones estándar de una fila de tabla.
 * @param {string | number} itemId - El ID del elemento al que se aplicarán las acciones.
 * @param {function} onViewDetails - Callback para ver los detalles (ej. abrir un diálogo).
 * @param {function} onDelete - Callback para eliminar el elemento.
 */
const TableActions = ({ itemId, onViewDetails, onDelete }) => {
    
    const handleView = () => {
        if (onViewDetails) {
            onViewDetails(itemId);
        }
    };

    const handleDelete = () => {
        if (onDelete) {
            onDelete(itemId);
        }
    };

    return (
        <div className={styles.actionsContainer}>
            {/* Botón para Ver Detalles */}
            <Button 
                onClick={handleView} 
                variant="icon-only" 
                aria-label={`Ver detalles del elemento ${itemId}`}
            >
                <Eye size={18} />
            </Button>

            {/* Botón para Eliminar */}
            <Button 
                onClick={handleDelete} 
                variant="icon-only"
                aria-label={`Eliminar el elemento ${itemId}`}
            >
                <Trash2 size={18} />
            </Button>
        </div>
    );
};

TableActions.propTypes = {
    itemId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    onViewDetails: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

export default TableActions;