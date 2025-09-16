import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './InputField.module.css';

const InputField = React.forwardRef(({ label, type = 'text', maxLength, value, onChange, ...props }, ref) => {
  const [currentValue, setCurrentValue] = useState(value || '');

  const handleChange = (e) => {
    // Si se provee una función onChange, la llamamos
    if (onChange) {
      onChange(e);
    }
    // Actualizamos el estado interno para el contador de caracteres
    setCurrentValue(e.target.value);
  };

  return (
    <div className={styles.inputContainer}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.inputWrapper}>
        <input
          ref={ref}
          type={type}
          className={styles.inputField}
          maxLength={maxLength}
          value={currentValue}
          onChange={handleChange}
          {...props}
        />
        {/* Contador de caracteres, se muestra si hay un maxLength definido */}
        {maxLength && (
          <span className={styles.charCounter}>
            {currentValue.length}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
});

InputField.propTypes = {
  label: PropTypes.string,
  type: PropTypes.string,
  maxLength: PropTypes.number,
  value: PropTypes.string,
  onChange: PropTypes.func,
};

export default InputField;