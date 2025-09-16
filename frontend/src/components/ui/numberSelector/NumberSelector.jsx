import React from 'react';
import PropTypes from 'prop-types';
import styles from './NumberSelector.module.css';
import { ChevronLeft, ChevronRight } from 'lucide-react'; // Importamos los iconos

const NumberSelector = ({ value, min = -5, max = 5, onChange, disabled = false }) => {
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  return (
    <div className={styles.selectorWrapper}>
      <button 
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        className={styles.buttonLeft}
      >
        <ChevronLeft size={24} />
      </button>

      <div className={styles.valueDisplay}>{value}</div>

      <button
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        className={styles.buttonRight}
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
};

NumberSelector.propTypes = {
  value: PropTypes.number.isRequired,
  min: PropTypes.number,
  max: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default NumberSelector;