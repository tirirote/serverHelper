import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './Slider.module.css';

const Slider = React.forwardRef(({ title, value, min = 0, max = 100, onChange, disabled = false, ...props }, ref) => {
  const [isFocused, setIsFocused] = useState(false);

  // Calcula el porcentaje del valor para el track de progreso
  const progressPercent = ((value - min) / (max - min)) * 100;
  const wrapperClass = `${styles.sliderWrapper} ${isFocused ? styles.focusedWrapper : ''} ${disabled ? styles.disabledWrapper : ''}`;


  return (
    <div className={styles.container}>
      {title && <p>{title}</p>}
      <div className={wrapperClass}>
        <span className={styles.valueLabel}>{value}</span>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={onChange}
          disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={styles.sliderInput}
          style={{ '--progress-percent': `${progressPercent}%` }}
        />
        <span className={styles.maxLabel}>{max}</span>
      </div>
    </div>
  );
});

Slider.propTypes = {
  title: PropTypes.string,
  value: PropTypes.number.isRequired,
  min: PropTypes.number,
  max: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default Slider;