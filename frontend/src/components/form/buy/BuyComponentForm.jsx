import React, { useState } from 'react';
import PropTypes from 'prop-types';
import InputField from '../../ui/input/InputField.jsx';
import Button from '../../ui/button/Button.jsx';
import DetailsField from '../../ui/details/DetailsField.jsx';
import CompatibilityList from '../component/CompatibilityList.jsx';
import ModelViewer from '../../3d/ModelViewer.jsx';
import styles from '../Forms.module.css'; // Reutilizaremos los estilos del formulario de componente
import { X, Search } from 'lucide-react';

const BuyComponentForm = ({ onClose }) => {
    // Datos de mock para el componente a comprar
    const component = {
        name: 'COMPONENT NAME',
        buyPrice: '100€',
        maintenancePrice: '2.50 USD/month',
        type: 'Type',
        details: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis sapien sapien, pretium sit amet nulla ut, pharetra malesuada sem. Vivamus sit amet lacus eleifend, iaculis orci nec, pharetra libero. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Aenean blandit turpis in ipsum feugiat sagittis. Etiam in nunc ut erat mattis dignissim non vitae quam. Aenean et facilisis magna. Etiam ligula risus, blandit eget imperdiet eget, dapibus in ex. Phasellus ac ligula luctus elit venenatis porttitor et ut nulla. In congue lorem tellus. Fusce pellentesque egestas dolor, eu egestas libero tincidunt ut. Etiam arcu nulla, aliquam in mauris vitae, pretium luctus mi. Vestibulum eu eros sit amet ante vestibulum vehicula. Aenean hendrerit, eros vel volutpat tincidunt, neque nibh aliquam enim, lacinia congue lorem risus et metus.',
        modelPath: '/assets/models/test.glb',
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
                <h2 className={styles.buyPrice}>{component.buyPrice}</h2>
            </div>
            <div className={styles.content}>
                <ModelViewer modelPath={component.modelPath} />
                <div className={styles.detailsSection}>
                    <div className={styles.detailItem}>
                        <label className={styles.detailLabel}>Component Type</label>
                        <span>{component.type}</span>
                    </div>
                    <div className={styles.detailItem}>
                        <label className={styles.detailLabel}>Maintenance Cost</label>
                        <span>{component.maintenancePrice}</span>
                    </div>
                </div>
                <div>
                    <DetailsField
                        label="DETAILS"
                        value={component.details}
                        readOnly={true}
                    />
                </div>
                <CompatibilityList items={component.compatibleWith} />
            </div>
            <div className={styles.buyButton}>
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