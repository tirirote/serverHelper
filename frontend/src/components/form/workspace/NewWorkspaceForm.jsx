import React, { useState, useEffect } from 'react';
import { useToast } from '../../ui/toasts/ToastProvider.jsx';
import Button from '../../ui/button/Button.jsx';
import InputField from '../../ui/input/InputField.jsx';
import DetailsField from '../../ui/details/DetailsField.jsx';
import GenericSelector from '../../ui/selector/GenericSelector.jsx'
import styles from '../Forms.module.css'; // Estilos genéricos para formularios

//API Services
import { getAllNetworks } from '../../../api/services/networkService.js'
/**
 * Formulario para la creación de un nuevo Workspace.
 * * @param {Object} props - Propiedades del componente.
 * @param {function} props.onClose - Función para cerrar el modal o diálogo. Acepta un booleano (true si la creación fue exitosa).
 */
const NewWorkspaceForm = ({ onClose }) => {
    const { showToast } = useToast();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [availableNetworks, setAvailableNetworks] = useState([]);
    const [selectedNetworks, setSelectedNetworks] = useState([]);
    const [networkLoading, setNetworkLoading] = useState(true);

    // Fetch de redes disponibles
    useEffect(() => {
        const fetchNetworks = async () => {
            setNetworkLoading(true);
            try {
                // Usamos el servicio de redes para obtener los ítems disponibles
                const data = await getAllNetworks();
                setAvailableNetworks(data);
            } catch (error) {
                console.error('Error al cargar redes:', error);
                showToast('Error al cargar la lista de redes disponibles.', 'error');
            } finally {
                setNetworkLoading(false);
            }
        };
        fetchNetworks();
    }, [showToast]);

    const handleAddNetwork = (newItem) => {
        setSelectedNetworks(prev => [...prev, newItem]);
    };

    const handleRemoveNetwork = (itemId) => {
        setSelectedNetworks(prev => prev.filter(item => item.id !== itemId));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (name.trim().length < 3) {
            showToast('El nombre del workspace debe tener al menos 3 caracteres.', 'warning');
            return;
        }

        if (selectedNetworks.length === 0) {
            showToast('Debes asignar al menos una red (VPC o Subnet).', 'warning');
            return;
        }

        const newWorkspaceData = {
            name: name.trim(),
            description: description.trim(),
            network: network.trim()
        };

        console.log('Workspace creado (Simulación):', newWorkspaceData);

        // Mostrar notificación de éxito
        showToast(`Workspace '${name}' de tipo '${type}' creado exitosamente.`, 'success');

        // Cerrar el modal, indicando éxito
        onClose(true);

    };

    return (
        <div className={styles.formContainer}>
            <header className={styles.header}>
                <h1>Nuevo Workspace</h1>
            </header>

            <form onSubmit={handleSubmit} className={styles.form}>

                {/* Nombre del Workspace */}
                <InputField
                    label="Workspace Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={30}
                    placeholder="Escribe el nombre del workspace aquí..."
                />

                {/* Detalles/Descripción */}
                <DetailsField
                    label="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={255}
                    placeholder="Breve resumen del propósito del workspace."
                />

                <GenericSelector
                    availableItems={availableNetworks}
                    compatibleItems={selectedNetworks}
                    onAddComponent={handleAddNetwork}
                    onRemoveComponent={handleRemoveNetwork}
                    isLoading={networkLoading || isLoading}
                    selectorTitle="Asigna una red"
                    listTitle='Red Asignada'
                    singleSelection={true}
                />

                {/* Botón de Envío */}
                <div className={styles.doneButton}>
                    <Button type="submit" variant="primary">Crear Workspace</Button>
                </div>
            </form>
        </div>
    );
};

export default NewWorkspaceForm;