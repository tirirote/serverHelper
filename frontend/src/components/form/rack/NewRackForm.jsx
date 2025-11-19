import React, { useState } from 'react';
import PropTypes from 'prop-types';
import InputField from '../../ui/input/InputField.jsx';
import DetailsField from '../../ui/details/DetailsField.jsx';
import NumberSelector from '../../ui/numberSelector/NumberSelector.jsx';
import Button from '../../ui/button/Button.jsx';
import styles from '../Forms.module.css'; // Reutilizaremos los estilos del formulario de componente
import { PlusCircle } from 'lucide-react';

const NewRackForm = ({ onClose }) => {
    const [rackName, setRackName] = useState('');
    const [description, setDescription] = useState('');
    const [units, setUnits] = useState(0);
    const [servers, setServers] = useState([]); // Array para los servidores

    const handleSubmit = (e) => {
        e.preventDefault();
        // Lógica de mock para el envío del formulario de rack
        console.log({ rackName, description, units, servers });
        alert('Formulario de rack enviado (mock).');
        onClose();
    };

    // Lógica de mock para añadir un servidor a la lista
    const handleAddServer = () => {
        const newServerId = servers.length + 1;
        setServers([...servers, { id: newServerId, name: `Server-${newServerId}` }]);
    };

    return (
        <div className={styles.formContainer}>
            <div className={styles.header}>
                <h2>NEW RACK</h2>
            </div>
            <form onSubmit={handleSubmit} className={styles.form}>
                <InputField
                    label="RACK NAME"
                    value={rackName}
                    onChange={(e) => setRackName(e.target.value)}
                    maxLength={50}
                    placeholder="Escribe el nombre aquí..."
                />
                <DetailsField
                    label="DESCRIPTION"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={255}
                    placeholder="Escribe la descripción aquí..."
                />
                <div className={styles.unitsContainer}>
                    <label>UNITS</label>
                    <NumberSelector
                        value={units}
                        min={0}
                        onChange={setUnits}
                    />
                </div>
                <div className={styles.serversContainer}>
                    <label>SERVERS</label>
                    <Button
                        onClick={handleAddServer}
                        variant="ghost"
                        className={styles.addServerButton}
                    >
                        + New Server
                    </Button>
                </div>
                {servers.length > 0 && (
                    <div className={styles.serversList}>
                        {servers.map(server => (
                            <div key={server.id} className={styles.serversListItem}>
                                <span>{server.name}</span>
                            </div>
                        ))}
                    </div>
                )}
                <div className={styles.doneButton} >
                    <Button type="submit" >DONE</Button>
                </div>
            </form>
        </div>
    );
};

NewRackForm.propTypes = {
    onClose: PropTypes.func.isRequired,
};

export default NewRackForm;