import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Loader2 } from 'lucide-react';
import Button from '../../ui/button/Button.jsx';
import InputField from '../../ui/input/InputField.jsx';
import NumberSelector from '../../ui/numberSelector/NumberSelector.jsx';
import { useToast } from '../../ui/toasts/ToastProvider.jsx'
// API Services
import { getAllComponents } from '../../../api/services/componentService.js'; // Usamos la misma función de la tienda
import styles from './ComponentSelector.module.css'; // Crearás un archivo de estilos para este
import GenericList from '../../ui/list/GenericList.jsx';

// El ComponentSelector es un formulario de búsqueda y adición.
// Recibe una función `onAddComponent` para pasar el componente seleccionado al formulario padre.
const ComponentSelector = ({ onAddComponent, compatibleItems, onRemoveComponent }) => {
    const { showToast } = useToast();
    const [allComponents, setAllComponents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedComponent, setSelectedComponent] = useState(null);

    // 1. Fetch de Componentes Disponibles
    const fetchComponents = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAllComponents();
            setAllComponents(data);
        } catch (err) {
            console.error('Error al cargar componentes disponibles:', err);
            showToast('Error al cargar la lista de componentes disponibles.', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchComponents();
    }, [fetchComponents]);

    // 2. Lógica de Filtrado
    const filteredComponents = allComponents.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        item.name !== selectedComponent?.name // Evitar mostrar el ya seleccionado
    );

    // 3. Manejador de Selección
    const handleSelectComponent = (item) => {
        setSelectedComponent(item);
        setQuantity(1); // Resetear cantidad al seleccionar uno nuevo
        setSearchTerm(item.name); // Mostrar el nombre del seleccionado en la barra
    };

    // 4. Manejador de Adición
    const handleAdd = () => {
        if (!selectedComponent || quantity <= 0) {
            showToast('Selecciona un componente y una cantidad válida.', 'warning');
            return;
        }

        // Crear el objeto de componente a agregar
        const newCompatibleItem = {
            ...selectedComponent,
            count: quantity,
        };

        // Pasar al componente padre (NewServerForm)
        onAddComponent(newCompatibleItem);

        // Resetear el estado para la próxima adición
        setSelectedComponent(null);
        setSearchTerm('');
        setQuantity(1);
        showToast(`Se agregó ${quantity}x ${selectedComponent.name} a la lista.`, 'info');
    };

    const handleSearchChange = (e) => {
        const newTerm = e.target.value;
        setSearchTerm(newTerm);
        // [CORRECCIÓN] Si el usuario empieza a escribir, borramos cualquier selección previa.
        if (selectedComponent && newTerm !== selectedComponent.name) {
            setSelectedComponent(null);
        }
    };

    if (loading) {
        return (
            <div className={styles.loading}>
                <Loader2 size={20} className="animate-spin" /> Cargando Componentes...
            </div>
        );
    }

    return (
        <div className={styles.componentSelector}>
            <label className={styles.label}>Añadir Componentes Compatible</label>

            <div className={styles.searchAndSelect}>
                {/* Campo de búsqueda */}
                <InputField
                    icon={<Search size={20} />}
                    value={searchTerm}
                    onChange={handleSearchChange} 
                    placeholder="Buscar componente por nombre..."
                />

                {/* Lista de Resultados Desplegable */}
                {searchTerm && filteredComponents.length > 0 && (
                    <div className={styles.resultsDropdown}>
                        {filteredComponents.map(item => (
                            <div
                                key={item.id}
                                className={styles.resultItem}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => handleSelectComponent(item)}
                            >
                                {item.name} <span className={styles.categoryBadge}>{item.type}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Configuración de Cantidad y Botón de Añadir */}
            {selectedComponent && (
                <div className={styles.addComponentArea}>
                    <p className={styles.selectedItemText}>
                        Seleccionado: {selectedComponent.name}
                    </p>
                    <div className={styles.quantityAndButton}>
                        <NumberSelector
                            value={quantity}
                            min={1}
                            max={100} // Límite arbitrario para la cantidad
                            onChange={setQuantity}
                        />
                        <Button
                            variant="secondary"
                            size="small"
                            onClick={handleAdd}
                            style={{ width: 'auto' }}
                        >
                            <Plus size={18} /> Añadir
                        </Button>
                    </div>
                </div>
            )}
            <GenericList
                items={compatibleItems}
                onRemoveItem={onRemoveComponent} // Pasa la función de eliminación al componente de lista
                title="Componentes Asignados"
            />
        </div>
    );
};

export default ComponentSelector;