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
const InfoPill = ({ icon: Icon, label, value, color, isDescription = false }) => {
    // La lógica de las clases se resuelve mapeando las props a nombres de clases CSS
    const colorClass = styles[color] || styles.default;
    const layoutClass = isDescription ? styles.descriptionLayout : styles.defaultLayout;

    return (
        <div className={`${styles.infoPill} ${colorClass} ${layoutClass}`}>
            <Icon size={24} className={styles.icon} />
            <div className={styles.content}>
                <p className={styles.label}>{label}</p>
                {/* El estilo para el valor principal se aplica condicionalmente en el CSS */}
                <p className={styles.value}>{value}</p>
            </div>
        </div>
    );
};

export default InfoPill;