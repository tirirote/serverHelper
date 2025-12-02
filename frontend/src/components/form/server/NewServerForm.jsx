import React, { useState, useEffect } from 'react';
import InputField from '../../ui/input/InputField.jsx';
import NumberSelector from '../../ui/numberSelector/NumberSelector.jsx';
import Button from '../../ui/button/Button.jsx';
import DetailsField from '../../ui/details/DetailsField.jsx';
import GenericSelector from '../../ui/selector/GenericSelector.jsx';
import { useToast } from '../../ui/toasts/ToastProvider.jsx';
import styles from '../Forms.module.css'; // Reutilizaremos los estilos del formulario de componente
//API Services
import { getAllComponents } from '../../../api/services/componentService.js';
const NewServerForm = ({ onClose, onSubmit, racks = [] }) => {
    const { showToast } = useToast();
    const [serverName, setServerName] = useState('');
    const [details, setDetails] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // NUEVOS ESTADOS ESPECÍFICOS DE SERVIDOR

    // Lista de compatibilidad simulada (puede ser Components, Racks, etc.)
    const [availableItems, setAvailableItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]); // components selected
    const [compatibleComponents, setCompatibleComponents] = useState([]);
    const [compatibleRacks, setCompatibleRacks] = useState([]);
    const [itemLoading, setItemLoading] = useState(true);
    const [selectedRack, setSelectedRack] = useState(racks && racks.length > 0 ? racks[0] : null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch de items disponibles
    useEffect(() => {
        const fetchItems = async () => {
            setItemLoading(true);
            try {
                // Usamos el servicio de redes para obtener los ítems disponibles
                const data = await getAllComponents();
                setAvailableItems(data);
            } catch (error) {
                console.error('Error al cargar items:', error);
                showToast('Error al cargar la lista de items disponibles.', 'error');
            } finally {
                setItemLoading(false);
            }
        };
        fetchItems();
    }, [showToast]);

    useEffect(() => {
        if (racks && racks.length > 0 && !selectedRack) {
            setSelectedRack(racks[0]);
            setCompatibleRacks([racks[0]]);
        }
    }, [racks]);

    // Función para manejar la adición de un componente desde el selector
    const handleAddItem = (newItem) => {
        setSelectedItems(prev => [...prev, newItem]);
        setCompatibleComponents(prev => [...prev, newItem]);
    };

    const handleRemoveItem = (itemId) => {
        setSelectedItems(prev => prev.filter(item => item.id !== itemId));
        setCompatibleComponents(prev => prev.filter(item => item.id !== itemId));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log(selectedItems)

        // sanitize components to avoid sending complex objects (possible circular refs)
        const serverData = {
            name: serverName,
            components: selectedItems.map(item => ({
                name: item.name,
                type: item.type,
                price: item.price,
                maintenanceCost: item.maintenanceCost,
                estimatedConsumption: item.estimatedConsumption,
                isSelled: item.isSelled,
                modelPath: item.modelPath
            })),
            description: details,
            rackName: selectedRack?.name,
            ipAddress: '10.0.0.2'
        };

        // Aquí iría la llamada a la API de creación de servidor (e.g., createServer(serverData))
        if (!selectedRack) {
            showToast('Debes seleccionar un Rack destino antes de crear el servidor.', 'warning');
            return;
        }

        try {
            setIsSubmitting(true);
            // Añadir `rackName` si se seleccionó uno
            if (selectedRack) serverData.rackName = selectedRack.name;
            if (onSubmit) {
                await onSubmit(serverData);
            }
            onClose(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.formContainer}>
            <div className={styles.header}>
                <h1>Nuevo Servidor</h1>
            </div>
            <form onSubmit={handleSubmit} className={styles.form}>
                {/* Nombre del Servidor */}
                <InputField
                    label="Server Name"
                    value={serverName}
                    onChange={(e) => setServerName(e.target.value)}
                    maxLength={30}
                    placeholder="Escribe el nombre del servidor aquí..."
                />

                {/* Detalles/Descripción */}
                <DetailsField
                    label="Details"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    maxLength={255}
                    placeholder="Escribe especificaciones o detalles importantes..."
                />
                <GenericSelector
                    availableItems={racks}
                    compatibleItems={compatibleRacks}
                    onAddComponent={(rack) => {
                        setSelectedRack(rack);
                        setCompatibleRacks([rack]);
                    }}
                    onRemoveComponent={() => {
                        setSelectedRack(null);
                        setCompatibleRacks([]);
                    }}
                    isLoading={itemLoading || isLoading}
                    selectorTitle="Rack destino"
                    listTitle='Rack Seleccionado'
                    singleSelection={true}
                />
                <GenericSelector
                    availableItems={availableItems}
                    compatibleItems={compatibleComponents}
                    onAddComponent={handleAddItem}
                    onRemoveComponent={handleRemoveItem}
                    isLoading={itemLoading || isLoading}
                    selectorTitle="Busca Componentes"
                    listTitle='Componentes Seleccionados'
                />
                <div className={styles.doneButton}>
                    <Button type="submit" variant="primary" disabled={isSubmitting}>{isSubmitting ? 'CREATING...' : 'Crear Servidor'}</Button>
                </div>

            </form>
        </div>
    );
};

export default NewServerForm;