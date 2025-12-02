import React from 'react';
import PropTypes from 'prop-types';
import styles from './NumberSelector.module.css';
import { ChevronLeft, ChevronRight } from 'lucide-react'; // Importamos los iconos

const NumberSelector = ({ title = 'Selecciona', value, unit = "€", min = -5, max = 5, onChange, disabled = false }) => {

  const currentValue = typeof value === 'number' && !isNaN(value) ? value : 0;

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

  const handleDecrement = () => {
    safeOnChange(currentValue - 1);
  };

  const handleIncrement = () => {
    safeOnChange(currentValue + 1);
  };

  return (
    <div className={styles.selectorContainer}>

      {!title !== '' && !title && (<label className={styles.selectorLabel}>{title}</label>)}
      <div className={styles.selectorBody}>
        <button
          type='button'
          onClick={handleDecrement}
          disabled={disabled || value <= min}
          className={styles.buttonLeft}
        >
          <ChevronLeft size={24} />
        </button>

        <div className={styles.valueDisplay}>{value}{unit}</div>

        <button
          type='button'
          onClick={handleIncrement}
          disabled={disabled || value >= max}
          className={styles.buttonRight}
        >
          <ChevronRight size={24} />
        </button>
      </div>
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