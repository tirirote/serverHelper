import React from 'react';
import PropTypes from 'prop-types';
import styles from './Callout.module.css';
import { Info, AlertTriangle, XCircle } from 'lucide-react';

const Callout = ({ type = 'info', children }) => {
    const iconMap = {
        info: <Info size={24} />,
        warning: <AlertTriangle size={24} />,
        danger: <XCircle size={24} />,
    };

    return (
        <div className={`${styles.callout} ${styles[type]}`}>
            <span className={styles.icon}>{iconMap[type]}</span>
            <div className={styles.content}>
                {children}
            </div>
        </div>
    );
};

Callout.propTypes = {
    type: PropTypes.oneOf(['info', 'warning', 'danger']),
    children: PropTypes.node.isRequired,
};

export default Callout;