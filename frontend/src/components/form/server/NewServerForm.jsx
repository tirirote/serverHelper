import React, { useState, useEffect } from 'react';
import InputField from '../../ui/input/InputField.jsx';
import NumberSelector from '../../ui/numberSelector/NumberSelector.jsx';
import Button from '../../ui/button/Button.jsx';
import DetailsField from '../../ui/details/DetailsField.jsx';
import { X, Check } from 'lucide-react';
import GenericSelector from '../../ui/selector/GenericSelector.jsx';
import { useToast } from '../../ui/toasts/ToastProvider.jsx';
import styles from '../Forms.module.css'; // Reutilizaremos los estilos del formulario de componente
//API Services
import { getAllComponents } from '../../../api/services/componentService.js';
import { getAllWorkspaces } from '../../../api/services/workspaceService.js';
import { getAllRacks } from '../../../api/services/rackService.js';

const NewServerForm = ({ onClose, onSubmit, racks: propsRacks = null, initialSelectedRack = null, initialActiveWorkspace = null }) => {
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
    const [isSubmitting, setIsSubmitting] = useState(false);


    const [racks, setRacks] = useState(propsRacks || []);
    const [racksLoading, setRacksLoading] = useState(true);

    const [workspaces, setWorkspaces] = useState([]);
    const [workspacesLoading, setWorkspacesLoading] = useState(true);
    const [activeWorkspace, setActiveWorkspace] = useState(initialActiveWorkspace || null);
    const [selectedRack, setSelectedRack] = useState(racks && racks.length > 0 ? racks[0] : null);

    const fetchRacks = async (workspace) => {
        setRacksLoading(true);
        try {
            if (workspace) {
                const list = await getAllRacks(workspace.name);
                setRacks(list || []);
                // set default selected rack
                if (list && list.length > 0) {
                    setSelectedRack(list[0]);
                    setCompatibleRacks([list[0]]);
                } else {
                    setSelectedRack(null);
                    setCompatibleRacks([]);
                }
            } else {
                setRacks([]);
            }
        } catch (err) {
            console.error('Error al cargar los racks:', err);
            showToast('Error de conexión con el servidor.', 'error');
        } finally {
            setRacksLoading(false);
        }
    };

    const fetchWorkspaces = async () => {
        setWorkspacesLoading(true);
        try {
            // Usamos el servicio de redes para obtener los ítems disponibles
            const data = await getAllWorkspaces();
            setWorkspaces(data);
        } catch (error) {
            console.error('Error al cargar workspaces:', error);
            showToast('Error al cargar la lista de workspaces disponibles.', 'error');
        } finally {
            setWorkspacesLoading(false);
        }
    };

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

    // Fetch de items disponibles
    useEffect(() => {
        fetchWorkspaces();
        fetchItems();
    }, []);

    useEffect(() => {
        if (racks && racks.length > 0 && !selectedRack) {
            setSelectedRack(racks[0]);
            setCompatibleRacks([racks[0]]);
        }
    }, [racks]);

    // If props provide an initial selected rack, prefill
    useEffect(() => {
        if (!initialSelectedRack) return;
        setSelectedRack(initialSelectedRack);
        setCompatibleRacks([initialSelectedRack]);
        // also ensure we set active workspace from rack if provided
        if (initialSelectedRack.workspaceName && workspaces && workspaces.length > 0) {
            const ws = workspaces.find(w => w.name === initialSelectedRack.workspaceName);
            if (ws) setActiveWorkspace(ws);
        }
    }, [initialSelectedRack, workspaces]);

    // When active workspace changes fetch racks for that workspace
    useEffect(() => {
        setRacks([]);
        setSelectedRack(null);
        setCompatibleRacks([]);
        if (activeWorkspace) fetchRacks(activeWorkspace);
    }, [activeWorkspace]);

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
            description: details,
            components: selectedItems.map(item => ({
                name: item.name,
                type: item.type,
                price: item.price,
                maintenanceCost: item.maintenanceCost,
                estimatedConsumption: item.estimatedConsumption,
                isSelled: item.isSelled,
                modelPath: item.modelPath
            })),
            rackName: selectedRack.name,
            ipAddress: '10.0.0.2'
        };

        try {
            setIsSubmitting(true);
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
                    label="Nombre"
                    value={serverName}
                    onChange={(e) => setServerName(e.target.value)}
                    maxLength={30}
                    placeholder="Escribe el nombre del servidor aquí..."
                />

                {/* Detalles/Descripción */}
                <DetailsField
                    label="Descripción"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    maxLength={255}
                    placeholder="Escribe especificaciones o detalles importantes..."
                />
                <GenericSelector
                    availableItems={workspaces}
                    compatibleItems={activeWorkspace ? [activeWorkspace] : []}
                    onAddComponent={(ws) => {
                        // select workspace to load racks for it
                        setActiveWorkspace(ws);
                        setRacks([]);
                        setSelectedRack(null);
                        setCompatibleRacks([]);
                    }}
                    onRemoveComponent={() => {
                        setActiveWorkspace(null);
                        setRacks([]);
                        setSelectedRack(null);
                        setCompatibleRacks([]);
                    }}
                    isLoading={itemLoading || isLoading || workspacesLoading}
                    selectorTitle="Workspace"
                    listTitle='Workspace Seleccionado'
                    singleSelection={true}
                />
                {activeWorkspace && (
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
                        isLoading={racksLoading || itemLoading || isLoading}
                        selectorTitle="Rack"
                        listTitle='Rack Seleccionado'
                        singleSelection={true}
                    />
                )}
                <GenericSelector
                    availableItems={availableItems.filter(c => c.isSelled)}
                    compatibleItems={compatibleComponents}
                    onAddComponent={handleAddItem}
                    onRemoveComponent={handleRemoveItem}
                    isLoading={itemLoading || isLoading}
                    selectorTitle="Componentes"
                    listTitle='Componentes Seleccionados'
                />
                {/* Botones de Acción */}
                <div className={styles.actionButtons}>
                    <Button variant="secondary" onClick={onClose}>
                        <X size={24} />
                    </Button>
                    <Button variant="primary" type="submit">
                        <Check size={24} />
                    </Button>
                </div>

            </form>
        </div>
    );
};

export default NewServerForm;