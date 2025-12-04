import React from 'react';
import PropTypes from 'prop-types';
import styles from './NumberSelector.module.css';
import { ChevronLeft, ChevronRight } from 'lucide-react'; // Importamos los iconos

const NumberSelector = ({ title = 'Selecciona', value, unit = "€", min = -5, max = 5, onChange, disabled = false }) => {

  const currentValue = value || 0;

  const safeOnChange = (newValue) => {
    if (onChange) {
      if (newValue < min) {
        onChange(min);
      } else if (newValue > max) {
        onChange(max);
      } else {
        onChange(newValue);
      }
    }
  };

  const handleChange = (e) => {
    if (onChange) {
      safeOnChange(e);
    }
  };

  const handleDecrement = () => {
    safeOnChange(currentValue - 1);
  };

  const handleIncrement = () => {
    safeOnChange(currentValue + 1);
  };

  return (
    <div className={styles.selectorContainer}>

      {title && (<label className={styles.selectorLabel}>{title}</label>)}
      <div className={styles.selectorBody}>
        <button
          type='button'
          onClick={handleDecrement}
          disabled={disabled || value <= min}
          className={styles.buttonLeft}
        >
          <ChevronLeft size={24} />
        </button>

        <input
          className={styles.inputField}
          type='text'
          value={value}
          onChange={(e) => handleChange(Number(e.target.value))}
          disabled={disabled}
          min={min}
          max={max}
        />
        
        <button
          type='button'
          onClick={handleIncrement}
          disabled={disabled || value >= max}
          className={styles.buttonRight}
        >
          <ChevronRight size={24} />
        </button>
      </div>
      {unit && (<span className={styles.unitLabel}>{unit}</span>)}
    </div>
  );
};

NumberSelector.propTypes = {
  title: PropTypes.string,
  value: PropTypes.number.isRequired,
  unit: PropTypes.string,
  min: PropTypes.number,
  max: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default NumberSelector;