import React, { useState } from 'react';
import InputField from '../../ui/input/InputField.jsx';
import NumberSelector from '../../ui/numberSelector/NumberSelector.jsx';
import Button from '../../ui/button/Button.jsx';
import CompatibilityList from './CompatibilityList.jsx';
import DetailsField from '../../ui/details/DetailsField.jsx'; // Importar el nuevo componente
import styles from '../Forms.module.css'; // Reutilizaremos los estilos del formulario de componente
import DropdownMenu from '../../ui/dropdown/DropdownMenu.jsx'

const mandatoryComponentTypes = [
    'CPU',
    'RAM',
    'HardDisk',
    'BiosConfig',
    'Fan',
    'PowerSupply',
    'ServerChasis',
    'NetworkInterface',
    'OS'
];

const dropdownItems = mandatoryComponentTypes.map(type => ({
    label: type,
    value: type
}));

const NewComponentForm = ({ onClose }) => {
    const [componentName, setComponentName] = useState('');
    const [details, setDetails] = useState('');
    const [cost, setCost] = useState(0);

    const [formData, setFormData] = useState({
        name: '',
        type: '', // <--- ¡CAMBIO AQUÍ! Estado inicial para el dropdown
        assetType: 'Physical',
        // ... otros campos
    });

    const compatibleWith = [
        { id: 1, name: 'Rack-1', count: 1 },
        { id: 2, name: 'Server-1', count: 1 },
        { id: 3, name: 'Cable-2', count: 1 },
    ];

    const handleTypeChange = (newType) => {
        setFormData(prev => ({ ...prev, type: newType }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log({ componentName, details, cost });
        alert('Formulario de componente enviado (mock).');
        onClose();
    };

    return (
        <div className={styles.formContainer}>
            <div className={styles.header}>
                <h1>New Component</h1>
            </div>
            <form onSubmit={handleSubmit} className={styles.form}>
                <InputField
                    label="Component Name"
                    value={componentName}
                    onChange={(e) => setComponentName(e.target.value)}
                    maxLength={30}
                    placeholder="Escribe el nombre aquí..."
                />
                {/* Usar el nuevo componente de DetailsField */}
                <DetailsField
                    label="Details"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    maxLength={255}
                    placeholder="Escribe los detalles aquí..."
                />
                <DropdownMenu
                    label='Tipo'
                    items={dropdownItems} // <-- Usa la lista mapeada
                    value={formData.type} // <-- Usa el estado
                    onChange={handleTypeChange} // <-- Usa el nuevo manejador
                    placeholder="Selecciona el tipo"
                />
                <div className={styles.costContainer}>
                    <label>Cost</label>
                    <NumberSelector
                        value={cost}
                        min={0}
                        onChange={setCost}
                    />
                    <span className={styles.currency}>€</span>
                </div>
                <CompatibilityList items={compatibleWith} />
                <div className={styles.doneButton}>
                    <Button type="submit">DONE</Button>
                </div>

            </form>
        </div>
    );
};

export default NewComponentForm;