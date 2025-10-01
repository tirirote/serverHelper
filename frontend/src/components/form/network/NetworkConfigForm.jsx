// src/components/forms/NetworkConfigForm.jsx
import React, { useState } from 'react';
import InputField from '../../ui/input/InputField.jsx'; // Usamos tu InputField con lupa/ícono
import Button from '../../ui/button/Button.jsx';
import DetailsField from '../../ui/details/DetailsField.jsx'; // Usamos tu campo de texto grande
import styles from './NetworkConfigForm.module.css';
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
                placeholder="Ej: Prod-Web-Internal"
                value={formData.networkName}
                onChange={handleChange}
                startAdornment={<Network size={20} />}
                required
            />

            {/* Máscara de Subred */}
            <InputField
                label="Máscara de Subred"
                name="subnetMask"
                placeholder="255.255.255.0"
                value={formData.subnetMask}
                onChange={handleChange}
                startAdornment={<Server size={20} />}
                required
            />

            {/* Gateway IP */}
            <InputField
                label="Gateway IP"
                name="gatewayIP"
                placeholder="Ej: 192.168.1.1"
                value={formData.gatewayIP}
                onChange={handleChange}
                startAdornment={<Server size={20} />}
                required
            />

            {/* Servidor DNS (Opcional) */}
            <InputField
                label="Servidor DNS Primario (Opcional)"
                name="dnsServer"
                placeholder="Ej: 8.8.8.8"
                value={formData.dnsServer}
                onChange={handleChange}
                startAdornment={<Info size={20} />}
            />

            {/* Descripción (Usando tu DetailsField) */}
            <DetailsField
                label="Descripción de la Red"
                name="description"
                placeholder="Una breve explicación sobre el propósito de esta subred."
                value={formData.description}
                onChange={handleChange}
                maxLength={200}
            />

            {/* Botones de Acción */}
            <div className={styles.actions}>
                <Button variant="primary" onClick={onClose} type="button">
                    Cancelar
                </Button>
                <Button variant="primary" type="submit">
                    Guardar Configuración
                </Button>
            </div>
        </form>
    );
};

export default NetworkConfigForm;