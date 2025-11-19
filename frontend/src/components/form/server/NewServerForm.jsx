import React, { useState } from 'react';
import InputField from '../../ui/input/InputField.jsx';
import NumberSelector from '../../ui/numberSelector/NumberSelector.jsx';
import Button from '../../ui/button/Button.jsx';
import DetailsField from '../../ui/details/DetailsField.jsx';
import ComponentSelector from '../component/ComponentSelector.jsx';
import styles from '../Forms.module.css'; // Reutilizaremos los estilos del formulario de componente

const NewServerForm = ({ onClose }) => {
    const [serverName, setServerName] = useState('');
    const [details, setDetails] = useState('');
    // NUEVOS ESTADOS ESPECÍFICOS DE SERVIDOR
    const [rackUnits, setRackUnits] = useState(1); // Unidades de rack (U)
    const [consumption, setConsumption] = useState(100); // Consumo estimado en Watts (W)

    // Lista de compatibilidad simulada (puede ser Components, Racks, etc.)
    const [compatibleItems, setCompatibleItems] = useState([]);

    // Función para manejar la adición de un componente desde el selector
    const handleAddComponent = (newItem) => {
        setCompatibleItems(prevItems => {
            // Verificar si el componente ya existe
            const existingItemIndex = prevItems.findIndex(item => item.id === newItem.id);

            if (existingItemIndex > -1) {
                // Si existe, actualizar la cantidad
                return prevItems.map((item, index) =>
                    index === existingItemIndex
                        ? { ...item, count: item.count + newItem.count }
                        : item
                );
            } else {
                // Si no existe, añadir el nuevo componente
                return [...prevItems, newItem];
            }
        });
    };

    const handleRemoveComponent = (itemId) => {
        setCompatibleItems(prevItems => prevItems.filter(item => item.id !== itemId));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const serverData = {
            serverName,
            details,
            rackUnits,
            consumption,
            compatibleItems
        };

        // Aquí iría la llamada a la API de creación de servidor (e.g., createServer(serverData))
        console.log('Formulario de servidor enviado (mock). Datos:', serverData);

        // Simulación: Cerrar el modal y notificar al padre
        // En un caso real, llamarías a onClose(true) si la API fue exitosa.
        onClose(true);
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
                <ComponentSelector
                    onAddComponent={handleAddComponent}
                    compatibleItems={compatibleItems}
                    onRemoveComponent={handleRemoveComponent} 
                    />

                <div className={styles.doneButton}>
                    <Button type="submit" variant="primary">Crear Servidor</Button>
                </div>

            </form>
        </div>
    );
};

export default NewServerForm;