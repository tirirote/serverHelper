import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Server, Trash2, Zap, AlertTriangle, ArrowRight, XCircle, ChevronRight } from 'lucide-react';

// Componentes externos simulados
import { useToast } from '../../components/ui/toasts/ToastProvider.jsx';
import DataTable from '../../components/ui/table/DataTable.jsx';
import TableActions from '../../components/ui/table/TableActions.jsx';
import Dialog from '../../components/ui/dialog/Dialog.jsx';
import Button from '../../components/ui/button/Button.jsx';
import SearchFilterBar from '../../components/ui/searchbar/SearchFilterBar.jsx';

// Componentes internos
import ComponentCard from './ComponentCard.jsx';
import styles from './MyComponents.module.css';

// MOCK Data para Componentes
export const initialComponents = [
    // --- Componente 1: Servidor Base (Proporcionado por el usuario) ---
    {
        id: 'i-101',
        name: 'Servidor Base R-10',
        category: 'Server',
        description: 'Servidor genérico de 1U, ideal para desarrollo.',
        price: 1200.00,
        maintenanceCost: 15.00,
        estimatedConsumption: 150, // Consumo en Watts (W)
        compatibleWith: [
            // Esto asume que estos IDs (1, 2, 3) corresponden a otros componentes/accesorios
            { id: 1, name: 'Rack-1', count: 1 },
            { id: 2, name: 'Server-1', count: 1 },
            { id: 3, name: 'Cable-2', count: 1 },
        ],
        modelPath: '/assets/models/server-closed.glb'
    },

    // --- Componente 2: Array de Almacenamiento SSD ---
    {
        id: 'i-102',
        name: 'Array Almacenamiento SSD-T',
        category: 'Storage',
        description: 'Unidad de almacenamiento de estado sólido (NVMe) de alta velocidad, 10TB en configuración RAID.',
        price: 3500.00,
        maintenanceCost: 45.50,
        estimatedConsumption: 80, // Consumo en Watts (W)
        compatibleWith: [
            { id: 1, name: 'Rack-1', count: 2 }, // Ocupa 2 unidades de Rack
            { id: 4, name: 'Cable SFP+', count: 4 }, // Necesita 4 cables de fibra
        ],
        modelPath: '/assets/models/nas.glb'
    },

    // --- Componente 3: Switch de Red Core ---
    {
        id: 'i-103',
        name: 'Switch Core 48-Port',
        category: 'Network',
        description: 'Switch de agregación de capa 3 con 48 puertos 10GbE y 4 uplinks 40GbE.',
        price: 5800.00,
        maintenanceCost: 60.00,
        estimatedConsumption: 220, // Consumo en Watts (W)
        compatibleWith: [
            { id: 1, name: 'Rack-1', count: 1 },
            { id: 5, name: 'Cable CAT6', count: 48 }, // Puertos de cobre
            { id: 4, name: 'Cable SFP+', count: 4 },  // Puertos de fibra
        ],
        modelPath: '/assets/models/switch.glb'
    },

    // --- Componente 4: Unidad de Distribución de Energía (PDU) ---
    {
        id: 'i-104',
        name: 'PDU Inteligente 1U',
        category: 'Accessory',
        description: 'Unidad de distribución de energía con medición de consumo por puerto y control remoto.',
        price: 750.00,
        maintenanceCost: 5.00,
        estimatedConsumption: 5, // Consumo de la propia unidad
        compatibleWith: [
            { id: 1, name: 'Rack-1', count: 1 },
            { id: 6, name: 'Cable C13/C14', count: 12 }, // Máximo 12 dispositivos conectados
        ],
        modelPath: '/assets/models/ups.glb'
    },

    // --- Componente 5: Módulo de Memoria RAM ECC ---
    {
        id: 'i-105',
        name: 'Memoria RAM 64GB ECC',
        category: 'Memory',
        description: 'Módulo de 64GB DDR4 ECC. Esencial para servidores y workstations.',
        price: 450.00,
        maintenanceCost: 0.00,
        estimatedConsumption: 10, // Por módulo
        compatibleWith: [
            { id: 'i-101', name: 'Servidor Base R-10', count: 1 }, // Compatible con el Servidor R-10
            { id: 7, name: 'Workstation T-200', count: 1 },
        ],
        modelPath: '/assets/models/ram.glb'
    },
    {
        id: 'i-106',
        name: 'NVIDIA GForce 4090',
        category: 'GPU',
        description: 'Tarjeta gráfica de alto rendimineto, para Gráficos, diseño y CUDA.',
        price: 1299.00,
        maintenanceCost: 0.00,
        estimatedConsumption: 10, // Por módulo
        compatibleWith: [
            { id: 'i-101', name: 'Servidor Base R-10', count: 1 }, // Compatible con el Servidor R-10
            { id: 7, name: 'Workstation T-200', count: 1 },
        ],
        modelPath: '/assets/models/gpu.glb'
    },
];

const MyComponents = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [components, setComponents] = useState(initialComponents);
    const [searchTerm, setSearchTerm] = useState('');

    // Estados para la eliminación
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [componentToDelete, setComponentToDelete] = useState(null);

    // Estado para el componente visualizado en 3D
    const [activeComponent, setActiveComponent] = useState(initialComponents[0]);


    // Lógica de filtrado
    const filteredComponents = useMemo(() => {
        if (!searchTerm) {
            return components;
        }
        const lowerCaseSearch = searchTerm.toLowerCase();
        return components.filter(comp =>
            comp.name.toLowerCase().includes(lowerCaseSearch) ||
            comp.type.toLowerCase().includes(lowerCaseSearch) ||
            comp.vendor.toLowerCase().includes(lowerCaseSearch) ||
            comp.id.toLowerCase().includes(lowerCaseSearch)
        );
    }, [components, searchTerm]);

    // Navegación simulada a la tienda
    const handleGoToStore = () => {
        showToast('Navegando a la tienda de componentes.', 'info');
        navigate('/store'); // Simulación de ruta
    };

    // Abre el Dialog de confirmación de eliminación
    const handleDeleteComponent = (component) => {
        setComponentToDelete(component);
        setIsDeleteModalOpen(true);
    };

    // Finaliza la eliminación después de la confirmación
    const handleConfirmDelete = () => {
        if (!componentToDelete) return;

        setComponents(prev => {
            const newComponents = prev.filter(comp => comp.id !== componentToDelete.id);
            // Si el componente eliminado era el activo, establece el primero de la lista como activo
            if (activeComponent && activeComponent.id === componentToDelete.id) {
                setActiveComponent(newComponents[0] || null);
            }
            return newComponents;
        });
        showToast(`Componente "${componentToDelete.name}" retirado del inventario.`, 'error');

        setIsDeleteModalOpen(false);
        setComponentToDelete(null);
    };

    // Maneja las acciones de la tabla
    const handleTableAction = (action, id) => {
        const component = components.find(comp => comp.id === id);
        if (!component) return;

        if (action === 'delete') {
            handleDeleteComponent(component);
        } else if (action === 'view') {
            // Acción "view" en esta página cambia el modelo 3D activo
            setActiveComponent(component);
            showToast(`Visualizando modelo 3D de ${component.name}.`, 'success');
        }
    };

    // Función para obtener la clase de estilo según el estado
    const getStatusClass = (status) => {
        switch (status) {
            case 'Active': return styles.statusActive;
            case 'Maintenance': return styles.statusMaintenance;
            case 'Retired': return styles.statusRetired;
            default: return 'text-gray-400';
        }
    };

    // Definición de las columnas para el componente DataTable
    const columns = useMemo(() => [
        {
            header: 'ID',
            key: 'id',
            render: (item) => <span className={styles.idCell}>{item.id}</span>
        },
        {
            header: 'Nombre del Componente',
            key: 'name',
            render: (item) => (
                // Al hacer clic en el nombre, se activa la vista 3D
                <div
                    className={`${styles.nameCellLink} ${item.id === activeComponent?.id ? styles.activeName : ''}`}
                    onClick={() => handleTableAction('view', item.id)}
                >
                    {item.name}
                </div>
            )
        },
        {
            header: 'Acciones',
            key: 'actions',
            className: styles.centerAlign,
            render: (item) => (
                <TableActions
                    itemId={item.id}
                    onViewDetails={(id) => handleTableAction('view', id)} // Usado para activar la vista 3D
                    onDelete={(id) => handleTableAction('delete', id)}
                    viewLabel="Ver 3D"
                    deleteLabel="Retirar"
                />
            )
        },
    ], [components, activeComponent]);


    return (
        <div className={styles.myComponentsPage}>
            <header className={styles.header}>
                <h1>
                    Inventario de Componentes
                </h1>
                <Button
                    variant="secondary"
                    onClick={handleGoToStore}
                >
                    Tienda <ChevronRight size={20}/>
                </Button>
            </header>

            <div className={styles.contentGrid}>
                {/* Columna de Visualización 3D */}
                <div className={styles.visualizerColumn}>
                    <ComponentCard component={activeComponent} />
                </div>

                {/* Columna de la Lista y Búsqueda */}
                <div className={styles.listColumn}>
                    <SearchFilterBar
                        onSearchChange={setSearchTerm}
                        searchPlaceholder="Buscar por nombre, tipo o proveedor..."
                    />

                    <div className={styles.tableContainer}>
                        {filteredComponents.length === 0 && searchTerm ? (
                            <div className={styles.emptyState}>
                                <XCircle size={40} className={styles.emptyIcon} />
                                <p>No se encontraron componentes que coincidan con "{searchTerm}".</p>
                            </div>
                        ) : filteredComponents.length === 0 && !searchTerm ? (
                            <div className={styles.emptyState}>
                                <ShoppingBag size={40} className={styles.emptyIcon} />
                                <p>Tu inventario está vacío. ¡Visita la tienda para empezar!</p>
                            </div>
                        ) : (
                            <DataTable
                                data={filteredComponents}
                                columns={columns}
                                initialSortBy="name"
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Dialogo de Confirmación de Eliminación */}
            <Dialog
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Confirmar Retiro de Inventario"
                confirmText="Retirar Componente"
                confirmVariant="danger"
            >
                <div className={styles.dialogDangerContent}>
                    <AlertTriangle size={24} style={{ marginRight: '10px' }} className="text-red-500" />
                    <div>
                        <p className="text-gray-700">
                            Estás a punto de retirar el componente <strong>{componentToDelete?.name}</strong> del inventario.
                            Esta acción asume que has desinstalado el hardware físicamente.
                            ¿Confirmas la retirada?
                        </p>
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default MyComponents;