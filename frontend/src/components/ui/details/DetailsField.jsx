import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './DetailsField.module.css';

const DetailsField = ({ label, maxLength = 255, placeholder = '', value, onChange }) => {
  return (
    <div className={styles.detailsField}>
      <label>{label}</label>
      <textarea
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        placeholder={placeholder}
      />
      <span className={styles.charCounter}>{value.length}/{maxLength}</span>
    </div>
  );
};

DetailsField.propTypes = {
  label: PropTypes.string.isRequired,
  maxLength: PropTypes.number,
  placeholder: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default DetailsField;