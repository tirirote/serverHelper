import React from 'react';
import PropTypes from 'prop-types';
import styles from './CompatibilityList.module.css';

const CompatibilityList = ({ items }) => {
    return (
        <div className={styles.listContainer}>
            <label>Compatible with:</label>
            <div className={styles.list}>
                {items.map(item => (
                    <div key={item.id} className={styles.listItem}>
                        <span>{item.name}</span>
                        <span>({item.count})</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

CompatibilityList.propTypes = {
    items: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        count: PropTypes.number.isRequired,
    })).isRequired,
};

export default CompatibilityList;