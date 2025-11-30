import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import InputField from '../../ui/input/InputField.jsx';
import DetailsField from '../../ui/details/DetailsField.jsx';
import NumberSelector from '../../ui/numberSelector/NumberSelector.jsx';
import Button from '../../ui/button/Button.jsx';
import styles from '../Forms.module.css'; // Reutilizaremos los estilos del formulario de componente
import { PlusCircle } from 'lucide-react';
import GenericSelector from '../../ui/selector/GenericSelector.jsx';
import { getAllServers } from '../../../api/services/serverService.js';

const NewRackForm = ({ onClose, onSubmit, workspaces = [] }) => {
    const [rackName, setRackName] = useState('');
    const [description, setDescription] = useState('');
    const [units, setUnits] = useState(0);
    const [selectedServers, setSelectedServers] = useState([]); // Array para los servidores agregados
    const [availableServers, setAvailableServers] = useState([]);
    const [serverLoading, setServerLoading] = useState(true);
    const [selectedWorkspace, setSelectedWorkspace] = useState(workspaces && workspaces.length ? workspaces[0] : null);

    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const rackData = { name: rackName.trim(), description: description.trim(), units };
        if (selectedWorkspace && (selectedWorkspace.name || selectedWorkspace.id)) {
            rackData.workspaceName = selectedWorkspace.name || selectedWorkspace.id;
        }
        // Incluir servidores por nombre
        if (selectedServers && selectedServers.length > 0) {
            rackData.servers = selectedServers.map(s => s.name || s.id);
        }
        try {
            setIsLoading(true);
            if (onSubmit) {
                await onSubmit(rackData);
            }
        } finally {
            setIsLoading(false);
            onClose(true);
        }
    };

    // Add and remove handlers for GenericSelector
    const handleAddServer = (server) => {
        setSelectedServers(prev => [...prev, server]);
    };

    const handleRemoveServer = (server) => {
        const idOrName = server.id || server.name;
        setSelectedServers(prev => prev.filter(s => (s.id || s.name) !== idOrName));
    };

    useEffect(() => {
        const fetchServers = async () => {
            setServerLoading(true);
            try {
                const data = await getAllServers();
                setAvailableServers(data || []);
            } catch (err) {
                console.error('Error fetching servers for NewRackForm', err);
            } finally {
                setServerLoading(false);
            }
        };
        fetchServers();
    }, []);

    useEffect(() => {
        if (workspaces && workspaces.length > 0 && !selectedWorkspace) {
            setSelectedWorkspace(workspaces[0]);
        }
    }, [workspaces]);

    return (
        <div className={styles.formContainer}>
            <div className={styles.header}>
                <h1>Nuevo Rack</h1>
            </div>
            <form onSubmit={handleSubmit} className={styles.form}>
                <InputField
                    label="Nombre del Rack"
                    value={rackName}
                    onChange={(e) => setRackName(e.target.value)}
                    maxLength={50}
                    placeholder="Escribe el nombre aquí..."
                />
                <DetailsField
                    label="Descripción"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={255}
                    placeholder="Escribe la descripción aquí..."
                />
                <NumberSelector
                    title='Unidades'
                    value={units}
                    min={0}
                    max={42}
                    onChange={setUnits}
                    unit='U'
                />
                <GenericSelector
                    availableItems={availableServers}
                    compatibleItems={selectedServers}
                    onAddComponent={handleAddServer}
                    onRemoveComponent={handleRemoveServer}
                    isLoading={serverLoading || isLoading}
                    selectorTitle="Añadir Servidores al Rack"
                    listTitle='Servidores Seleccionados'
                    singleSelection={false}
                />
                <div className={styles.doneButton} >
                    <Button type="submit" variant="primary" disabled={isLoading}>{isLoading ? 'CREATING...' : 'DONE'}</Button>
                </div>
            </form>
        </div>
    );
};

NewRackForm.propTypes = {
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func,
    workspaces: PropTypes.array,
};

export default NewRackForm;