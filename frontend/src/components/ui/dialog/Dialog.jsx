import React from 'react';
import PropTypes from 'prop-types';
import styles from './Dialog.module.css';
import { X } from 'lucide-react';

const Dialog = ({ children, isOpen, onClose }) => {
  if (!isOpen) {
    return null; // No renderiza nada si no está abierto
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className={styles.closeButton}>
          <X size={24} />
        </button>
        {children}
      </div>
    </div>
  );
};

Dialog.propTypes = {
  children: PropTypes.node.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Dialog;