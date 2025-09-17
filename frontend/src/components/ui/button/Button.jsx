import React from 'react';
import PropTypes from 'prop-types';
import styles from './Button.module.css';

const Button = ({ children, onClick, disabled, variant = 'primary' }) => {
  const buttonClass = `${styles.button} ${styles[variant]} ${disabled ? styles.disabled : ''}`;

  return (
    <button
      className={buttonClass}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  variant: PropTypes.oneOf(['primary', 'danger', 'secondary', 'ghost', 'icon-only']),
};

export default Button;