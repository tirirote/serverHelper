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
    const [rackUnits, setRackUnits] = useState(1); // Unidades de rack (U)
    const [consumption, setConsumption] = useState(100); // Consumo estimado en Watts (W)

    // Lista de compatibilidad simulada (puede ser Components, Racks, etc.)
    const [availableItems, setAvailableItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [compatibleItems, setCompatibleItems] = useState([]);
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
        }
    }, [racks]);

    // Función para manejar la adición de un componente desde el selector
    const handleAddItem = (newItem) => {
        setSelectedItems(prev => [...prev, newItem]);
        setCompatibleItems(prev => [...prev, newItem]);
    };

    const handleRemoveItem = (itemId) => {
        setSelectedItems(prev => prev.filter(item => item.id !== itemId));
        setCompatibleItems(prev => prev.filter(item => item.id !== itemId));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const serverData = {
            serverName,
            details,
            rackUnits,
            consumption,
            compatibleItems
        };

        // Aquí iría la llamada a la API de creación de servidor (e.g., createServer(serverData))
        if (!selectedRack) {
            showToast('Debes seleccionar un Rack destino antes de crear el servidor.', 'warning');
            return;
        }

        try {
            setIsSubmitting(true);
            // Añadir `rackName` si se seleccionó uno
            if (selectedRack) serverData.rackName = selectedRack.name || selectedRack.id;
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

                {/* Unidades de Rack (U) */}
                <div className={styles.costContainer}> {/* Reutilizamos la clase costContainer para el diseño */}
                    <label>Unidades de Rack (U)</label>
                    <NumberSelector
                        value={rackUnits}
                        min={1}
                        max={10}
                        onChange={setRackUnits}
                    />
                    <span className={styles.currency}>U</span>
                </div>

                {/* Consumo Estimado (Watts) */}
                <div className={styles.costContainer}>
                    <label>Consumo Estimado (W)</label>
                    <NumberSelector
                        value={consumption}
                        min={50}
                        step={10}
                        onChange={setConsumption}
                    />
                    <span className={styles.currency}>W</span>
                </div>
                <div style={{ marginBottom: '12px' }}>
                    <label>Rack destino</label>
                    <GenericSelector
                        availableItems={racks}
                        compatibleItems={selectedRack ? [selectedRack] : []}
                        onAddComponent={(rack) => {
                            setSelectedRack(rack);
                            setCompatibleItems([rack]);
                        }}
                        onRemoveComponent={() => {
                            setSelectedRack(null);
                            setCompatibleItems([]);
                        }}
                        isLoading={itemLoading || isLoading}
                        selectorTitle="Rack destino"
                        listTitle='Rack Seleccionado'
                        singleSelection={true}
                    />
                </div>

                <GenericSelector
                    availableItems={availableItems}
                    compatibleItems={compatibleItems}
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