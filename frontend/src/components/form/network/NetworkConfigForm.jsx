// src/components/forms/NetworkConfigForm.jsx
import React, { useState } from 'react';
import InputField from '../../ui/input/InputField.jsx'; // Usamos tu InputField con lupa/ícono
import Button from '../../ui/button/Button.jsx';
import DetailsField from '../../ui/details/DetailsField.jsx'; // Usamos tu campo de texto grande
import styles from '../Forms.module.css'; // Reutilizaremos los estilos del formulario de componente
import { Network, Server, Info } from 'lucide-react'; // Íconos para adornos

const NetworkConfigForm = ({ onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        networkName: '',
        ipAddress: '',
        subnetMask: '255.255.255.0/24', // Valor por defecto común
        gateway: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Aquí iría la lógica de validación de IPs y máscaras
        console.log('Datos de Red a enviar:', formData);

        const newNetworkPayload = {
            name: formData.networkName,
            ipAddress: formData.ipAddress,
            subnetMask: formData.subnetMask,
            gateway: formData.gateway
        };
        
        console.log('Payload de Nueva Red:', newNetworkPayload);

        if (onSubmit) {
            onSubmit(newNetworkPayload);
        }
    };

    return (
        <div className={styles.formContainer}>
            <div className={styles.header}>
                <h1>New Network</h1>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
                {/* Nombre de la Red */}
                <InputField
                    label="Network Name"
                    name="networkName"
                    placeholder="Escribe el nombre de red"
                    value={formData.networkName}
                    onChange={handleChange}
                    required
                />
                {/* Máscara de Subred */}
                <InputField
                    label="Ip Address"
                    name="ipAddress"
                    placeholder="Escribe la dirección IP"
                    value={formData.ipAddress}
                    onChange={handleChange}
                    required
                />

                {/* Máscara de Subred */}
                <InputField
                    label="Net Mask"
                    name="subnetMask"
                    placeholder="Escribe la máscara de red"
                    value={formData.subnetMask}
                    onChange={handleChange}
                    required
                />

                {/* Gateway IP */}
                <InputField
                    label="Gateway IP"
                    name="gateway"
                    placeholder="Escribe la puerta de enlace"
                    value={formData.gateway}
                    onChange={handleChange}
                    required
                />

                {/* Botones de Acción */}
                <div className={styles.doneButton}>
                    <Button variant="primary" type="submit">
                        Done
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default NetworkConfigForm;