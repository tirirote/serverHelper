import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './InputField.module.css';

const InputField = React.forwardRef(({
  label,
  type = 'text',
  maxLength,
  value,
  onChange,
  startAdornment,
  ...props
}, ref) => {

  const handleChange = (e) => {
    if (onChange) {
      onChange(e);
    }
  };

  const currentValue = value || '';

  return (
    <div className={styles.inputContainer}>
      {label && <label>{label}</label>}
      <div className={styles.inputWrapper}>
        {startAdornment && (
          <div className={styles.startAdornment}>
            {startAdornment}
          </div>
        )}
        <input
          ref={ref}
          type={type}
          name={label}
          className={
            `${styles.inputField} ${startAdornment ? styles.inputFieldWithAdornment : ''}`
          }
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
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  startAdornment: PropTypes.node
};

InputField.defaultProps = {
  type: 'text',
  value: '',
  onChange: () => { },
};

export default InputField;