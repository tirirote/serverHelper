import React, { useState } from 'react';
import PropTypes from 'prop-types';
import InputField from '../../ui/input/InputField.jsx';
import Button from '../../ui/button/Button.jsx';
import DetailsField from '../../ui/details/DetailsField.jsx';
import CompatibilityList from '../component/CompatibilityList.jsx';
import ModelViewer from '../../3d/ModelViewer.jsx';
import styles from './BuyComponentForm.module.css';
import { X, Search } from 'lucide-react';

const BuyComponentForm = ({ onClose }) => {
    // Datos de mock para el componente a comprar
    const component = {
        name: 'COMPONENT NAME',
        buyPrice: '100€',
        maintenancePrice: '2.50 USD/month',
        type: 'Type',
        details: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        modelPath: '/public/assets/models/test.glb',
        compatibleWith: [
            { id: 1, name: 'Rack-1', count: 1 },
            { id: 2, name: 'Server-1', count: 1 },
            { id: 3, name: 'Cable-2', count: 1 },
        ],
    };

    const handleBuy = () => {
        console.log(`Comprando componente: ${component.name}`);
        alert(`Compraste el componente: ${component.name}`);
        onClose();
    };

    return (
        <div className={styles.formContainer}>
            <div className={styles.header}>
                <h2>{component.name}</h2>
            </div>
            <div className={styles.content}>
                <ModelViewer modelPath={component.modelPath} />
                <div className={styles.detailsSection}>
                    <div className={styles.type}>
                        <label>Component Type</label>
                        <span>{component.type}</span>
                    </div>
                    <DetailsField
                        label="DETAILS"
                        value={component.details}
                        readOnly={true}
                    />
                </div>
                <CompatibilityList items={component.compatibleWith} />
            </div>
            <div className={styles.actions}>
                <div className={styles.priceContainer}>
                    <div className={styles.priceItem}>
                        <label>Buy Price</label>
                        <span className={styles.buyPrice}>{component.buyPrice}</span>
                    </div>
                    <div className={styles.priceItem}>
                        <label>Maintenance</label>
                        <span className={styles.maintenancePrice}>{component.maintenancePrice}</span>
                    </div>
                </div>
                <Button
                    onClick={handleBuy}
                    variant="primary"
                >
                    BUY
                </Button>
            </div>
        </div>
    );
};

BuyComponentForm.propTypes = {
    onClose: PropTypes.func.isRequired,
};

export default BuyComponentForm;