import React, { useState } from 'react';
import { useToast } from '../../ui/toasts/ToastProvider.jsx';

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

const typeToModelPath = {
    'CPU': '/assets/3d/cpu.glb',
    'RAM': '/assets/3d/ram_stick.glb',
    'HardDisk': '/assets/3d/hdd.glb',
    'BiosConfig': '/assets/3d/chip.glb',
    'Fan': '/assets/3d/server_fan.glb',
    'PowerSupply': '/assets/3d/power_supply.glb',
    'ServerChasis': '/assets/3d/server_chasis.glb',
    'NetworkInterface': '/assets/3d/nic_card.glb',
    'OS': '/assets/3d/os_icon.glb',
};

const dropdownItems = mandatoryComponentTypes.map(type => ({
    label: type,
    value: type
}));

const NewComponentForm = ({ onClose }) => {
    // Requeridos
    const { showToast } = useToast();
    const [type, setType] = useState('DefaultType'); // Necesario para Joi.string().required()
    const [name, setName] = useState('');
    const [cost, setCost] = useState(0); // Se guarda como string temporalmente

    // Opcionales/Nulos
    const [maintenanceCost, setMaintenanceCost] = useState(0);
    const [estimatedConsumption, setEstimatedConsumption] = useState(0);
    const [details, setDetails] = useState('');
    const [modelPath, setModelPath] = useState(0);

    // Booleano y Lista
    const [isSelled, setIsSelled] = useState(false); // Joi.boolean().default(false)
    const [selectedComponents, setSelectedComponents] = useState([]); // Array de objetos {id, name}




    // FUNCIÓN PARA NumberSelector (AÑADIDO)
    const handleNumberChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    }

    // handleTypeChange (ACTUALIZADO para asignar Model3DPath)
    const handleTypeChange = (newType) => {
        const newModelPath = typeToModelPath[newType] || '';

        setType(newType);
        setModelPath(newModelPath);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (name.trim().length < 3) {
            showToast('El nombre del componente debe tener al menos 3 caracteres.', 'warning');
            return;
        }

        if (!type) {
            showToast('Debes de seleccionar un tipo válido para el componente.', 'warning');
            return;
        }

        const newComponentData = {
            type: type,
            name: name.trim(),
            cost: parseFloat(cost) > 0 ? parseFloat(cost) : 0,
            maintenanceCost: maintenanceCost ? parseFloat(maintenanceCost) : null,
            estimatedConsumption: estimatedConsumption ? parseFloat(estimatedConsumption) : null,
            compatibleList: selectedComponents.map(c => c.name),
            details: details.trim(),
            isSelled: isSelled,
            modelPath: modelPath.trim() || null,
        };

        console.log("Datos de Nuevo Componente enviados:", newComponentData);

        showToast(`Componentee '${name}' creado exitosamente.`, 'success');
        onClose(true);
    };

    return (
        <div className={styles.formContainer}>
            <div className={styles.header}>
                <h1>New Component</h1>
            </div>
            <form onSubmit={handleSubmit} className={styles.form}>
                <InputField
                    label="Component Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
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
                    items={dropdownItems}
                    value={type}
                    onChange={handleTypeChange}
                    placeholder="Selecciona el tipo"
                />
                <div className={styles.costContainer}>
                    <NumberSelector
                        title='Coste'
                        value={cost}
                        min={0}
                        onChange={(e) => setCost(e)}
                    />
                    <NumberSelector
                        title='Mantenimiento'
                        unit='€/mes'
                        value={maintenanceCost}
                        min={0}
                        onChange={(e) => setMaintenanceCost(e)}
                    />
                    <NumberSelector
                        title='Consumo'
                        unit='w'
                        value={estimatedConsumption}
                        min={0}
                        onChange={(e) => setEstimatedConsumption(e)}
                    />
                </div>
                <div className={styles.doneButton}>
                    <Button type="submit">DONE</Button>
                </div>

            </form>
        </div>
    );
};

export default NewComponentForm;