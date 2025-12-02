import React from 'react';
import PropTypes from 'prop-types';
import styles from './Button.module.css';

const Button = ({ children, onClick, disabled, variant = 'primary', type = 'button' }) => {
  const buttonClass = `${styles.button} ${styles[variant]} ${disabled ? styles.disabled : ''}`;

  return (
    <button
      type={type}
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
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  variant: PropTypes.oneOf(['primary', 'danger', 'secondary', 'ghost', 'icon-only']),
};

export default Button;