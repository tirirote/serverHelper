import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ChevronDown, Check } from 'lucide-react';
import styles from './DropdownMenu.module.css'; // Importación del CSS modular

/**
 * Componente Dropdown modular y reutilizable.
 * Permite al usuario seleccionar un valor de una lista de opciones.
 *
 * @param {Array<Object>} items - Lista de opciones. Cada objeto debe tener 'label' y 'value'.
 * @param {string | number} value - El valor seleccionado actualmente.
 * @param {function} onChange - Callback que se llama cuando se selecciona una nueva opción.
 * @param {string} placeholder - Texto a mostrar cuando no hay valor seleccionado.
 */
const DropdownMenu = ({ label, items, value, onChange, placeholder = "Seleccionar Opción" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Encuentra la etiqueta (label) del valor seleccionado.
    const selectedItem = items.find(item => item.value === value);
    const displayLabel = selectedItem ? selectedItem.label : placeholder;

    // Cierra el menú cuando se hace clic fuera de él.
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (itemValue) => {
        onChange(itemValue);
        setIsOpen(false);
    };

    return (
        <div className={styles.dropdownContainer}>
            <label className={styles.label}>{label}</label>
            <div ref={dropdownRef} className={styles.dropdownContent}>

                <div className={styles.dropdownHeader}>
                    <span className={`${selectedItem ? styles.selectedLabel : styles.placeholder}`}>
                        {displayLabel}
                    </span>

                    <button
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        className={styles.button}
                        aria-expanded={isOpen}
                    >

                        {/* Icono de Flecha */}
                        <ChevronDown
                            className={`${styles.chevron} ${isOpen ? styles.chevronOpen : styles.chevronClosed}`}
                            aria-hidden="true"
                        />
                    </button>
                </div>

                {/* Menú Desplegable de Opciones */}
                {isOpen && (
                    <div
                        className={styles.menu}
                        role="menu"
                        aria-orientation="vertical"
                    >
                        {items.map((item) => (
                            <div
                                key={item.value}
                                onClick={() => handleSelect(item.value)}
                                className={`${styles.option} ${item.value === value ? styles.optionSelected : ''}`}
                                role="menuitem"
                            >
                                {item.label}
                                {/* Icono de Verificación si está seleccionado */}
                                {item.value === value && (
                                    <Check size={24} />
                                )}
                            </div>
                        ))}
                        {items.length === 0 && (
                            <div className={styles.noOptions}>
                                No hay opciones disponibles.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>

    );
};

// Definición de PropTypes para validación de tipos
DropdownMenu.propTypes = {
    label: PropTypes.string,
    items: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string.isRequired,
            value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        })
    ).isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
};

export default DropdownMenu;