import React from 'react';
import Button from './Button.jsx';
import styles from './ButtonShowcase.module.css';
import { Search, Trash2, X, PlusCircle } from 'lucide-react';

const ButtonShowcase = () => {
  return (
    <div className={styles.showcaseGrid}>
      {/* Botones de texto */}
      <div className={styles.category}>
        <h3>Botones de Texto</h3>
        <div className={styles.buttonGroup}>
          <Button variant="primary">Primario</Button>
          <Button variant="secondary">Secundario</Button>
          <Button variant="danger">Peligro</Button>
          <Button variant="ghost">Fantasma</Button>
        </div>
      </div>
      
      {/* Botones con iconos */}
      <div className={styles.category}>
        <h3>Botones con Texto e Icono</h3>
        <div className={styles.buttonGroup}>
          <Button variant="primary"><PlusCircle size={24} /> Añadir</Button>
          <Button variant="secondary"><Search size={24} /> Buscar</Button>
          <Button variant="danger"><Trash2 size={24} /> Borrar</Button>
        </div>
      </div>

      {/* Botones de solo icono */}
      <div className={styles.category}>
        <h3>Botones de Solo Icono</h3>
        <div className={styles.buttonGroup}>
          <Button variant="icon-only"><Search size={24} /></Button>
          <Button variant="icon-only"><X size={24} /></Button>
          <Button variant="icon-only" disabled><Trash2 size={24} /></Button>
        </div>
      </div>
      
      {/* Estados del botón */}
      <div className={styles.category}>
        <h3>Estados</h3>
        <div className={styles.buttonGroup}>
          <Button>Normal</Button>
          <Button disabled>Deshabilitado</Button>
        </div>
      </div>
    </div>
  );
};

export default ButtonShowcase;