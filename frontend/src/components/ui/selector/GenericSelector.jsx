import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Loader2 } from 'lucide-react';
import Button from '../button/Button.jsx';
import InputField from '../input/InputField.jsx';
import NumberSelector from '../numberSelector/NumberSelector.jsx';
import { useToast } from '../toasts/ToastProvider.jsx'
import styles from './GenericSelector.module.css';
import GenericList from '../list/GenericList.jsx';

// El ComponentSelector es un formulario de búsqueda y adición.
// Recibe una función `onAddComponent` para pasar el componente seleccionado al formulario padre.
const GenericSelector = ({
    onAddComponent,
    availableItems = [],
    compatibleItems = [],
    onRemoveComponent,
    isLoading,
    selectorTitle = 'Añadir Componentes Compatible',
    listTitle = 'Componentes Asignados',
    singleSelection = false }) => {
    const { showToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [selectedComponent, setSelectedComponent] = useState(null);
    const [isFocused, setIsFocused] = useState(false);

    // Usamos el ID del ítem si existe, sino el nombre, para ser más robustos
    const addedItemIdentifiers = compatibleItems.map(item => item.id || item.name);

    // 2. Lógica de Filtrado
    const filteredComponents = availableItems.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());

        // En modo selección múltiple, filtramos los que ya están agregados.
        if (!singleSelection) {
            return matchesSearch && !addedItemIdentifiers.includes(item.id || item.name);
        }

        // En modo selección única, solo filtramos por búsqueda.
        return matchesSearch;
    });

    // Determina si el desplegable debe ser visible
    const hasSingleItem = singleSelection && compatibleItems.length > 0;
    const isDropdownVisible = (isFocused || searchTerm) && filteredComponents.length > 0 && !selectedComponent && (!singleSelection || !hasSingleItem);


    // 3. Manejador de Selección
    const handleSelectComponent = (item) => {
        setSelectedComponent(item);
        setQuantity(1);
        setSearchTerm(item.name);
        setIsFocused(false); // Ocultar el desplegable después de la selección

        // LÓGICA DE SELECCIÓN ÚNICA: Ejecutar la adición inmediatamente al seleccionar
        if (singleSelection) {
            handleAdd(item);
        }
    };

    // 4. Manejador de Adición
    const handleAdd = (itemToAdd = selectedComponent) => {
        if (!itemToAdd || (!singleSelection && quantity <= 0)) {
            showToast('Selecciona un componente y, si aplica, una cantidad válida.', 'warning');
            return;
        }

        if (singleSelection) {
            // MODO SELECCIÓN ÚNICA: Llamar a onAddComponent con el ítem simple.
            onAddComponent(itemToAdd);
            showToast(`Se seleccionó: ${itemToAdd.name}.`, 'info');
        } else {
            // MODO SELECCIÓN MÚLTIPLE: Llamar a onAddComponent con el ítem y la cantidad.
            const newCompatibleItem = {
                ...itemToAdd,
                name: itemToAdd.name,
                count: quantity,
            };
            onAddComponent(newCompatibleItem);
            showToast(`Se agregó ${quantity}x ${itemToAdd.name} a la lista.`, 'info');
        }

        // Resetear el estado para la próxima adición
        setSelectedComponent(null);
        setSearchTerm('');
        setQuantity(1);
    };

    const handleSearchChange = (e) => {
        const newTerm = e.target.value;
        setSearchTerm(newTerm);
        // [CORRECCIÓN] Si el usuario empieza a escribir, borramos cualquier selección previa.
        if (selectedComponent && newTerm !== selectedComponent.name) {
            setSelectedComponent(null);
        }
    };

    // --- NUEVOS HANDLERS PARA FOCO ---
    const handleFocus = () => {
        setIsFocused(true);
    };

    // Para manejar el 'blur' y cerrar el dropdown, usamos un pequeño retraso
    // para permitir el evento 'click' en un ítem de la lista antes de que se oculte.
    const handleBlur = () => {
        setTimeout(() => {
            setIsFocused(false);
        }, 150);
    };

    if (isLoading) {
        return (
            <div className={styles.loading}>
                <Loader2 size={20} className="animate-spin" /> Cargando Componentes...
            </div>
        );
    }

    return (
        <div className={styles.componentSelector} >
            <label className={styles.label}>{selectorTitle}</label>

            {/* Mensaje de ítem seleccionado en modo único */}
            {hasSingleItem && (
                <p className={styles.selectedItemText}>
                    Seleccionado: {compatibleItems[0].name}
                </p>
            )}

            {/* El campo de búsqueda se oculta si ya hay un ítem seleccionado en modo único */}
            {(!singleSelection || !hasSingleItem) && (
                <div className={styles.searchAndSelect}>
                    <InputField
                        icon={<Search size={20} />}
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        placeholder="Buscar..."
                    />

                    {/* Lista de Resultados Desplegable */}
                    {isDropdownVisible && (
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
            )}


            {/* Configuración de Cantidad y Botón de Añadir (Solo visible en modo múltiple y si hay algo seleccionado) */}
            {!singleSelection && selectedComponent && (
                <div className={styles.addComponentArea}>
                    <p className={styles.selectedItemText}>
                        Seleccionado: {selectedComponent.name}
                    </p>
                    <div className={styles.quantityAndButton}>
                        <NumberSelector
                            value={quantity}
                            min={1}
                            max={100}
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

            {/* Lista de Componentes Asignados (Solo visible en modo múltiple) */}
            {!singleSelection && (
                <GenericList
                    items={compatibleItems}
                    onRemoveItem={onRemoveComponent}
                    title={listTitle} // Customizado con listTitle
                />
            )}
        </div >
    );
};

export default GenericSelector;