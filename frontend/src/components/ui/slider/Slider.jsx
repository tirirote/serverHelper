import React from 'react';
import PropTypes from 'prop-types';
import styles from './Slider.module.css';

const Slider = React.forwardRef(({ value, min = 0, max = 100, onChange, disabled = false, ...props }, ref) => {
  return (
    <div className={styles.sliderContainer}>
      <span className={styles.valueLabel}>{value}</span>
      <input
        ref={ref}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={styles.sliderInput}
        {...props}
      />
      <span className={styles.maxLabel}>{max}</span>
    </div>
  );
});

Slider.propTypes = {
  value: PropTypes.number.isRequired,
  min: PropTypes.number,
  max: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default Slider;