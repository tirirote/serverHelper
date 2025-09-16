import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './Toast.module.css';

// Puedes usar iconos de alguna librería como react-icons o iconos SVG personalizados
import { 
  BsInfoCircle, 
  BsExclamationCircle, 
  BsCheckCircle, 
  BsExclamationTriangle 
} from 'react-icons/bs';

const icons = {
  info: <BsInfoCircle />,
  error: <BsExclamationCircle />,
  success: <BsCheckCircle />,
  warning: <BsExclamationTriangle />,
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