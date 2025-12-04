import React, { useState } from 'react';
import { useToast } from '../../ui/toasts/ToastProvider.jsx';
import { Loader2, X, Check } from 'lucide-react';

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
    'CPU': '/assets/models/cpu.glb',
    'RAM': '/assets/models/ram.glb',
    'HardDisk': '/assets/models/harddisk.glb',
    'BiosConfig': '/assets/models/os.glb',
    'Fan': '/assets/models/fan.glb',
    'PowerSupply': '/assets/models/power_supply.glb',
    'ServerChasis': '/assets/models/server-closed.glb',
    'NetworkInterface': '/assets/models/ni.glb',
    'OS': '/assets/models/os.glb',
};

const dropdownItems = mandatoryComponentTypes.map(type => ({
    label: type,
    value: type
}));

const NewComponentForm = ({ onClose, onSubmit }) => {
    // Requeridos
    const { showToast } = useToast();
    const [type, setType] = useState('DefaultType'); // Necesario para Joi.string().required()
    const [name, setName] = useState('');
    const [cost, setCost] = useState(0); // Se guarda como string temporalmente

    // Opcionales/Nulos
    const [maintenanceCost, setMaintenanceCost] = useState(0);
    const [estimatedConsumption, setEstimatedConsumption] = useState(0);
    const [details, setDetails] = useState('');
    const [modelPath, setModelPath] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    // Booleano y Lista

    const [isSelled, setIsSelled] = useState(false); // Joi.boolean().default(false)
    const [selectedComponents, setSelectedComponents] = useState([]); // Array de objetos {id, name}




    // FUNCIÓN PARA NumberSelector (AÑADIDO)
    // handleNumberChange removed: NumberSelector directly updates state via callbacks

    // handleTypeChange (ACTUALIZADO para asignar Model3DPath)
    const handleTypeChange = (newType) => {
        const newModelPath = typeToModelPath[newType] || '';

        setType(newType);
        setModelPath(newModelPath);
    };

    const handleSubmit = async (e) => {
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
            price: parseFloat(cost) > 0 ? parseFloat(cost) : 0,
            compatibleList: [],
            maintenanceCost: maintenanceCost ? parseFloat(maintenanceCost) : null,
            estimatedConsumption: estimatedConsumption ? parseFloat(estimatedConsumption) : null,
            details: details.trim(),
            modelPath: modelPath.trim() || null,
        };

        console.log("Payload del nuevo componente:", newComponentData);

        try {
            setIsLoading(true);
            if (onSubmit) await onSubmit(newComponentData);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.formContainer}>
            <div className={styles.header}>
                <h1>New Component</h1>
            </div>
            <form onSubmit={handleSubmit} className={styles.form}>
                <InputField
                    label="Nombre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={30}
                    placeholder="Escribe el nombre aquí..."
                />
                {/* Usar el nuevo componente de DetailsField */}
                <DetailsField
                    label="Descripción"
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
                        max={9999}
                        onChange={(e) => setCost(e)}
                    />
                    <NumberSelector
                        title='Mantenimiento'
                        unit='€/mes'
                        value={maintenanceCost}
                        min={0}
                        max={9999}
                        onChange={(e) => setMaintenanceCost(e)}
                    />
                    <NumberSelector
                        title='Consumo'
                        unit='w'
                        value={estimatedConsumption}
                        min={0}
                        max={9999}
                        onChange={(e) => setEstimatedConsumption(e)}
                    />
                </div>
                {/* Botones de Acción */}
                <div className={styles.actionButtons}>
                    <Button variant="secondary" onClick={onClose}>
                        <X size={24} />
                    </Button>
                    <Button variant="primary" type="submit">
                        <Check size={24} />
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default NewComponentForm;