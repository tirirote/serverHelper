import React from 'react';
import styles from './InfoPill.module.css';

/**
 * Componente de visualización de información clave tipo "Pill" o tarjeta.
 * Utiliza un módulo CSS para manejar los estilos y variantes de color.
 *
 * @param {object} props
 * @param {React.Component} props.icon - Icono de Lucide React para mostrar.
 * @param {string} props.label - Etiqueta del dato (ej: "Red Asignada").
 * @param {string} props.value - Valor principal a mostrar.
 * @param {string} props.color - Variante de color ('indigo', 'green', 'gray', 'yellow').
 * @param {boolean} props.isDescription - Si es verdadero, el diseño se ajusta para texto más largo.
 */
const InfoPill = ({ label, value, color, details }) => {

    return (
        <div className={styles.infoPill}>
            <div className={styles.content}>
                <div className={styles.infoHeader}>
                    <label className={styles.label}>{label}</label>
                    <p className={styles.details}>{details}</p>
                </div>
                <span className={styles.value}>{value}</span>
            </div>
        </div>
    );
};

export default InfoPill;