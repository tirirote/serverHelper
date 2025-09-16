import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './NumberSelector.module.css';

const NumberSelector = ({ value, min = 0, max = 100, onChange, disabled = false }) => {
  const [currentValue, setCurrentValue] = useState(value);

  // Sincroniza el estado interno con la prop 'value' si cambia desde fuera
  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  const handleIncrement = () => {
    const newValue = Math.min(currentValue + 1, max);
    setCurrentValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleDecrement = () => {
    const newValue = Math.max(currentValue - 1, min);
    setCurrentValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <div className={styles.container}>
      <button 
        className={styles.button}
        onClick={handleDecrement}
        disabled={disabled || currentValue <= min}
      >
        <span>-</span>
      </button>

      <span className={styles.value}>{currentValue}</span>

      <button 
        className={styles.button}
        onClick={handleIncrement}
        disabled={disabled || currentValue >= max}
      >
        <span>+</span>
      </button>
    </div>
  );
};

NumberSelector.propTypes = {
  value: PropTypes.number.isRequired,
  min: PropTypes.number,
  max: PropTypes.number,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
};

export default NumberSelector;