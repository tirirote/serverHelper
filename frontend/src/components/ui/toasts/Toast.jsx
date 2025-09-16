import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './Toast.module.css';

// Importa los iconos específicos de lucide-react
import { 
  Info, 
  XCircle, 
  CheckCircle, 
  AlertTriangle 
} from 'lucide-react';

// Asigna los componentes de iconos a los tipos de toast
const icons = {
  info: <Info size={24} />,
  error: <XCircle size={24} />,
  success: <CheckCircle size={24} />,
  warning: <AlertTriangle size={24} />,
};

const Toast = ({ message, type = 'info', onDismiss }) => {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Inicia un temporizador para que el toast se oculte automáticamente
    const timer = setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(() => {
        onDismiss(); // Llama a la función para eliminar el toast del estado
      }, 300); // Duración de la animación de salida
    }, 4000); // 4 segundos antes de empezar a desvanecerse

    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className={`${styles.toast} ${styles[type]} ${isFadingOut ? styles.fadeOut : ''}`}>
      <span className={styles.icon}>{icons[type]}</span>
      <p className={styles.message}>{message}</p>
    </div>
  );
};

Toast.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['info', 'error', 'success', 'warning']),
  onDismiss: PropTypes.func.isRequired,
};

export default Toast;