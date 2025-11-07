import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Server, Cpu, HardDrive, MapPin, Calendar, Edit2, Save, X, RotateCcw, Trash2, AlertTriangle, Info } from 'lucide-react';

// Componentes externos simulados (Asumidos disponibles en la ruta relativa)
import { useToast } from '../../components/ui/toasts/ToastProvider.jsx';
import Dialog from '../../components/ui/dialog/Dialog.jsx'; 
import Input from '../../components/ui/input/InputField.jsx'; 
import Button from '../../components/ui/button/Button.jsx'; 

import styles from './ServerDetailsPage.module.css'; 

// --- MOCK Data (Simulación de la API) ---
const initialServers = [
    { 
        id: 'srv-101', name: 'Web Server Prod EU', os: 'Ubuntu 22.04', status: 'Running', healthStatus: 'Operational',
        cpu: '8 Cores', ram: '32 GB', network: '10 Gbps Ethernet', maintenanceCost: 85.50,
        description: 'Servidor de producción principal para la web.', region: 'europe-west1', 
        ip: '192.168.1.101', deployedDate: '2023-01-15',
        components: [
            { id: 1, name: "CPU Octa-Core Zen", price: 550.00 },
            { id: 2, name: "64GB RAM DDR5 ECC", price: 320.00 },
            { id: 3, name: "2x 4TB NVMe RAID", price: 600.00 },
        ],
    },
    // ... otros servidores
];

// Función para calcular el precio total de los componentes
const calculateTotalPrice = (components) => components.reduce((sum, comp) => sum + comp.price, 0);

// --- Componente Auxiliar para Visualización de Detalles ---
const DetailItem = ({ icon, label, value }) => (
    <div className={styles.detailItem}>
        <div className={styles.detailIcon}>{icon}</div>
        <div className={styles.detailBlock}>
            <div className={styles.detailLabel}>{label}</div>
            <div className={styles.detailValue}>{value}</div>
        </div>
    </div>
);

const ServerDetailsPage = () => {
    const { serverId } = useParams(); // Usar el ID de la URL
    const navigate = useNavigate();
    const { showToast } = useToast();

    // 1. Estados de la página
    const [server, setServer] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedServer, setEditedServer] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // 2. Estados de Diálogos
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isRestartModalOpen, setIsRestartModalOpen] = useState(false);

    // Simular carga de datos
    useEffect(() => {
        setIsLoading(true);
        const fetchedServer = initialServers.find(srv => srv.id === 'srv-101'); // Mockeamos srv-101
        
        if (fetchedServer) {
            // Asegurar que components tiene una propiedad price para el cálculo
            const serverWithPrice = {
                ...fetchedServer,
                totalPrice: calculateTotalPrice(fetchedServer.components),
            };
            setServer(serverWithPrice);
            setEditedServer(serverWithPrice);
        } else {
            // navigate('/servers'); // Descomentar en entorno real
        }
        setIsLoading(false);
    }, [serverId]); 

    // Obtener clase de estilo según el estado de salud
    const getHealthStyle = (status) => {
        switch (status) {
            case 'Operational': return styles.statusOperational;
            case 'Warning': return styles.statusWarning;
            case 'Critical': return styles.statusCritical;
            default: return styles.statusUnknown;
        }
    };

    // Manejadores
    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setEditedServer(prev => ({ ...prev, [id]: value }));
    };

    const handleComponentChange = (index, field, value) => {
        const newComponents = editedServer.components.map((comp, i) => {
            if (i === index) {
                return { ...comp, [field]: field === 'price' ? parseFloat(value) : value };
            }
            return comp;
        });
        setEditedServer(prev => ({ 
            ...prev, 
            components: newComponents,
            totalPrice: calculateTotalPrice(newComponents) // Recalcular precio
        }));
    };

    const handleSave = () => {
        // Validación simulada
        if (!editedServer.name || !editedServer.description) {
            showToast('El nombre y la descripción son obligatorios.', 'warning');
            return;
        }
        
        setServer(editedServer);
        setIsEditing(false);
        showToast(`Servidor "${editedServer.name}" actualizado.`, 'success');
    };

    const handleCancelEdit = () => {
        setEditedServer(server); 
        setIsEditing(false);
        showToast('Edición cancelada.', 'info');
    };

    const handleConfirmRestart = () => {
        showToast(`Comando de reinicio enviado para "${server.name}".`, 'info');
        setServer(prev => ({ ...prev, status: 'Starting' })); 
        setEditedServer(prev => ({ ...prev, status: 'Starting' })); 
        setIsRestartModalOpen(false);
    };

    if (isLoading || !server) {
        return <div className={styles.detailsPage}><p className={styles.loading}>Cargando detalles del servidor...</p></div>;
    }

    const srv = isEditing ? editedServer : server;

    return (
        <div className={styles.detailsPage}>
            
            {/* Header: Título y Acciones */}
            <header className={styles.header}>
                <div className={styles.titleContainer}>
                    <h1 className={styles.title}>
                        <Server size={32} className={styles.titleIcon} />
                        {isEditing ? (
                            <Input
                                id="name"
                                value={srv.name}
                                onChange={handleInputChange}
                                className={styles.nameInput}
                            />
                        ) : (
                            <span>{srv.name}</span>
                        )}
                    </h1>
                    {/* Status Badge */}
                    <span className={`${styles.statusBadge} ${getHealthStyle(srv.healthStatus)}`}>{srv.healthStatus}</span>
                </div>

                <div className={styles.actionButtons}>
                    {!isEditing ? (
                        <>
                            <Button variant="warning" onClick={() => setIsRestartModalOpen(true)}>
                                <RotateCcw size={18} style={{ marginRight: '5px' }} />
                                Reiniciar
                            </Button>
                            <Button variant="secondary" onClick={() => setIsEditing(true)}>
                                <Edit2 size={18} style={{ marginRight: '5px' }} />
                                Editar Info
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="secondary" onClick={handleCancelEdit}>
                                <X size={18} style={{ marginRight: '5px' }} />
                                Cancelar
                            </Button>
                            <Button variant="primary" onClick={handleSave}>
                                <Save size={18} style={{ marginRight: '5px' }} />
                                Guardar Config
                            </Button>
                        </>
                    )}
                </div>
            </header>

            {/* Contenido Principal: Resumen y Componentes */}
            <div className={styles.contentContainer}>
                
                {/* Panel de Resumen (Izquierda/Arriba) */}
                <div className={styles.summaryPanel}>
                    <h2 className={styles.panelTitle}>Resumen del Sistema</h2>
                    <div className={styles.detailsGrid}>
                        {/* Tarjetas de Datos Clave */}
                        <DetailItem icon={<Cpu size={20} />} label="Sistema Operativo" value={srv.os} />
                        <DetailItem icon={<HardDrive size={20} />} label="Red" value={srv.network} />
                        <DetailItem icon={<MapPin size={20} />} label="Dirección IP" value={srv.ip} />
                        <DetailItem icon={<Calendar size={20} />} label="Costo de Mantenimiento" value={`$${srv.maintenanceCost.toFixed(2)} / mes`} />
                        <DetailItem icon={<Info size={20} />} label="Precio Total (HW)" value={`$${srv.totalPrice.toFixed(2)}`} />
                    </div>

                    {/* Descripción */}
                    <div className={styles.descriptionBlock}>
                        <h3 className={styles.subTitle}>Descripción</h3>
                        {isEditing ? (
                            <textarea
                                id="description"
                                value={srv.description}
                                onChange={handleInputChange}
                                className={styles.textareaInput}
                                rows="3"
                            />
                        ) : (
                            <p className={styles.descriptionText}>{srv.description}</p>
                        )}
                    </div>
                </div>

                {/* Panel de Componentes (Derecha/Abajo) */}
                <div className={styles.componentsPanel}>
                    <h2 className={styles.panelTitle}>Componentes de Hardware ({srv.components.length})</h2>
                    
                    {isEditing ? (
                        <div className={styles.componentListEditable}>
                            {srv.components.map((comp, index) => (
                                <div key={index} className={styles.componentItemEditable}>
                                    <Input
                                        id={`comp-name-${index}`}
                                        value={comp.name}
                                        onChange={(e) => handleComponentChange(index, 'name', e.target.value)}
                                        placeholder="Nombre del Componente"
                                        className={styles.inputComponent}
                                    />
                                    <div className={styles.priceGroup}>
                                        <span className={styles.priceSymbol}>$</span>
                                        <Input
                                            id={`comp-price-${index}`}
                                            type="number"
                                            value={comp.price}
                                            onChange={(e) => handleComponentChange(index, 'price', e.target.value)}
                                            placeholder="0.00"
                                            className={styles.inputPrice}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <ul className={styles.componentList}>
                            {srv.components.map((component, index) => (
                                <li key={index} className={styles.componentItem}>
                                    <span className={styles.componentName}>{component.name}</span>
                                    <span className={styles.componentPrice}>${component.price.toFixed(2)}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                    
                    <div className={styles.totalPriceSummary}>
                        <span className={styles.totalLabel}>Precio Total de Hardware:</span>
                        <span className={styles.totalValue}>${srv.totalPrice.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Diálogo de Confirmación de Reinicio */}
            <Dialog
                isOpen={isRestartModalOpen}
                onClose={() => setIsRestartModalOpen(false)}
                onConfirm={handleConfirmRestart}
                title="Confirmar Reinicio"
                confirmText="Reiniciar Ahora"
            >
                <div className={styles.dialogBody}>
                    <AlertTriangle size={24} style={{ marginRight: '10px', color: '#f59e0b' }} />
                    <p>
                        ¿Estás seguro de que quieres **reiniciar** el servidor **{server?.name}**? 
                        Esto interrumpirá las operaciones actuales.
                    </p>
                </div>
            </Dialog>

        </div>
    );
};

export default ServerDetailsPage;