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
        subnetMask: '255.255.255.0', // Valor por defecto común
        gatewayIP: '',
        dnsServer: '',
        description: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Aquí iría la lógica de validación de IPs y máscaras
        console.log('Datos de Red a enviar:', formData);
        if (onSubmit) {
            onSubmit(formData);
        }
        if (onClose) {
            onClose();
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.formContainer}>
            <h2>Configuración de Subred</h2>
            
            {/* Nombre de la Red */}
            <InputField
                label="Nombre de la Red"
                name="networkName"
                placeholder="Escribe el nombre de red"
                value={formData.networkName}
                onChange={handleChange}
                required
            />

            {/* Máscara de Subred */}
            <InputField
                label="Máscara de Subred"
                name="subnetMask"
                placeholder="Escribe la máscara de red"
                value={formData.subnetMask}
                onChange={handleChange}
                required
            />

            {/* Gateway IP */}
            <InputField
                label="Gateway IP"
                name="gatewayIP"
                placeholder="Escribe la puerta de enlace"
                value={formData.gatewayIP}
                onChange={handleChange}
                required
            />

            {/* Servidor DNS (Opcional) */}
            <InputField
                label="Servidor DNS Primario (Opcional)"
                name="dnsServer"
                placeholder="Escribe el servidor DNS"
                value={formData.dnsServer}
                onChange={handleChange}
            />

            {/* Descripción (Usando tu DetailsField) */}
            <DetailsField
                label="Descripción de la Red"
                name="description"
                placeholder="Escribe una breve explicación sobre el propósito de esta red."
                value={formData.description}
                onChange={handleChange}
                maxLength={200}
            />

            {/* Botones de Acción */}
            <div className={styles.actions}>
                <Button variant="primary" type="submit">
                    Done
                </Button>
            </div>
        </form>
    );
};

export default NetworkConfigForm;