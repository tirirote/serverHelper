import React, { Children } from 'react';
import PropTypes from 'prop-types';
import styles from './Button.module.css';

const Button = ({ children, onClick, type = 'button', disabled = false, variant = 'primary', className }) => {
  // Detecta si el contenido es un único elemento que podría ser un icono
  const isIconButton = Children.count(children) === 1 && React.isValidElement(children) && children.type.displayName;

  return (
    <button
      className={`${styles.button} ${styles[variant]} ${isIconButton ? styles.iconButton : ''} ${className || ''}`}
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  disabled: PropTypes.bool,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger']),
  className: PropTypes.string,
};

export default Button;