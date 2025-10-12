// ... imports
import React, { useState } from 'react';
import Button from '../components/ui/button/Button.jsx';
import InputField from '../components/ui/input/InputField.jsx';
import Slider from '../components/ui/slider/Slider.jsx';
import NumberSelector from '../components/ui/numberSelector/NumberSelector.jsx';
import { useToast } from '../components/ui/toasts/ToastProvider.jsx';
import { Search, PlusCircle, Trash2 } from 'lucide-react';
import NewComponentForm from '../components/form/component/NewComponentForm.jsx';
import UserForm from '../components/form/user/UserForm.jsx';
import NewRackForm from '../components/form/rack/NewRackForm.jsx'; // Nuevo import
import BuyComponentForm from '../components/form/buy/BuyComponentForm.jsx';
import Dialog from '../components/ui/dialog/Dialog.jsx';
import styles from './Playground.module.css';
import ButtonShowcase from '../components/ui/button/ButtonShowcase.jsx'; // Nuevo import
import TextShowcase from '../components/ui/text/TextShowcase.jsx'; // Nuevo import
import SearchFilterBar from '../components/ui/searchbar/SearchFilterBar.jsx';
import DataTable from '../components/ui/table/DataTable.jsx';
import TableActions from '../components/ui/table/TableActions.jsx';
import ComponentGallery from '../components/ui/gallery/ComponentGallery.jsx';
import NetworkConfigForm from '../components/form/network/NetworkConfigForm.jsx';

const Playground = ({ handleLogout }) => {
  const { showToast } = useToast();
  const [sliderValue, setSliderValue] = useState(50);
  const [selectorValue, setSelectorValue] = useState(1);
  const [inputValue, setInputValue] = useState('');
  const [showComponentForm, setShowComponentForm] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showRackForm, setShowRackForm] = useState(false); // Nuevo estado
  const [showBuyForm, setShowBuyForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNetworkForm, setShowNetworkForm] = useState(false);
  
  const mockGalleryData = [
    { id: 'c-1', name: 'CPU Intel i9-14900K', type: 'Processor', cost: 799, status: 'Active', modelPath: '/assets/models/test.glb' },
    { id: 'c-2', name: 'RAM Corsair Vengeance 32GB', type: 'Memory', cost: 180, status: 'Active', modelPath: '/assets/models/test.glb' },
    { id: 'c-3', name: 'SSD Samsung 990 Pro 1TB', type: 'Storage', cost: 95, status: 'Inactive', modelPath: '/assets/models/test.glb' },
    { id: 'c-4', name: 'GPU NVIDIA RTX 4090', type: 'Graphics', cost: 1999, status: 'Error', modelPath: '/assets/models/test.glb' },
    { id: 'c-5', name: 'PSU Corsair HX1000i', type: 'Power Supply', cost: 250, status: 'Active', modelPath: '/assets/models/test.glb' },
    { id: 'c-6', name: 'Case Fractal Define 7', type: 'Case', cost: 150, status: 'Active', modelPath: '/assets/models/test.glb' },
  ];

  // 🚨 MANEJADOR DE SELECCIÓN PARA LA COMPRA
  const handleComponentSelect = (componentId) => {
    // Aquí normalmente pasarías el ID al formulario de compra
    showToast(`Componente seleccionado para compra: ${componentId}`, 'info');
    setShowBuyForm(true); // Abrir el formulario de compra
  };

  const mockTableData = [
    { id: 'c-1', name: 'CPU Intel i9', type: 'Processor', cost: 799, status: 'Active' },
    { id: 'c-2', name: 'RAM 32GB DDR5', type: 'Memory', cost: 180, status: 'Active' },
    { id: 'c-3', name: 'SSD 1TB NVMe', type: 'Storage', cost: 95, status: 'Inactive' },
    { id: 'c-4', name: 'GPU RTX 4090', type: 'Graphics', cost: 1999, status: 'Error' }
  ];

  const tableColumns = [
    { header: 'ID', key: 'id', render: (item) => <span style={{ fontWeight: 'bold' }}>{item.id}</span> },
    { header: 'Nombre', key: 'name' },
    { header: 'Tipo', key: 'type' },
    { header: 'Costo (€)', key: 'cost', render: (item) => `€${item.cost.toLocaleString('es-ES')}` },
    {
      header: 'Estado',
      key: 'status',
      render: (item) => {
        let statusColor;
        switch (item.status) {
          case 'Active': statusColor = 'var(--color-success)'; break;
          case 'Inactive': statusColor = 'var(--color-warning)'; break;
          case 'Error': statusColor = 'var(--color-error)'; break;
          default: statusColor = 'var(--color-info)';
        }
        return (
          <span style={{ color: statusColor }}>
            {item.status}
          </span>
        );
      }
    },
    {
      header: 'Acciones',
      key: 'actions', // Clave dummy
      render: (item) => (
        <TableActions
          itemId={item.id}
          onViewDetails={(id) => handleAction('view', id)}
          onDelete={(id) => handleAction('delete', id)}
        />
      )
    },
  ];

   // Función de ejemplo para manejar el envío del formulario de red
  const handleNetworkSubmit = (data) => {
    console.log('Network Config Saved:', data);
    showToast('Configuración de Red Guardada con éxito.', 'success');
  };

  const handleToast = (type) => {
    switch (type) {
      case 'success':
        showToast('Operación completada con éxito.', 'success');
        break;
      case 'error':
        showToast('Ha ocurrido un error inesperado.', 'error');
        break;
      case 'warning':
        showToast('Advertencia: hay datos incompletos.', 'warning');
        break;
      case 'info':
      default:
        showToast('Esto es un mensaje de información.', 'info');
        break;
    }
  };

  const handleFilterClick = () => {
    handleToast('info', 'El botón de Filtros funciona!');
  };

  return (
    <div className={styles.playgroundContainer}>
      <h1>Playground</h1>
      <p>
        Aquí puedes ver y probar todos los componentes de la UI y la tipografía de la aplicación.
      </p>

      {/* --- FORMULARIOS --- */}
      <section>
        <h2>Formularios</h2>
        <div className={styles.componentGrid}>
          <Button onClick={() => setShowComponentForm(true)}>Mostrar Formulario de Componente</Button>
          <Button onClick={() => setShowUserForm(true)}>Mostrar Formulario de Usuario</Button>
          <Button onClick={() => setShowRackForm(true)}>Mostrar Formulario de Rack</Button>
          <Button onClick={() => setShowBuyForm(true)}>Mostrar Formulario de Compra</Button>
          <Button onClick={() => setShowNetworkForm(true)}>Mostrar Formulario de Red</Button>
        </div>
      </section>

      {/* --- EL DIÁLOGO CONTIENE EL FORMULARIO DE COMPONENTE --- */}
      <Dialog isOpen={showComponentForm} onClose={() => setShowComponentForm(false)}>
        <NewComponentForm onClose={() => setShowComponentForm(false)} />
      </Dialog>

      {/* --- EL DIÁLOGO CONTIENE EL FORMULARIO DE USUARIO --- */}
      <Dialog isOpen={showUserForm} onClose={() => setShowUserForm(false)}>
        <UserForm onClose={() => setShowUserForm(false)} />
      </Dialog>

      {/* --- EL DIÁLOGO CONTIENE EL FORMULARIO DE RACK --- */}
      <Dialog isOpen={showRackForm} onClose={() => setShowRackForm(false)}>
        <NewRackForm onClose={() => setShowRackForm(false)} />
      </Dialog>

      {/* --- EL DIÁLOGO CONTIENE EL FORMULARIO DE COMPRA --- */}
      <Dialog isOpen={showBuyForm} onClose={() => setShowBuyForm(false)}> {/* Nuevo diálogo */}
        <BuyComponentForm onClose={() => setShowBuyForm(false)} />
      </Dialog>

      {/* 🚨 DIÁLOGO PARA EL FORMULARIO DE RED */}
      <Dialog 
        isOpen={showNetworkForm} 
        onClose={() => setShowNetworkForm(false)}
        title="Configurar Network"
      >
        <NetworkConfigForm 
          onClose={() => setShowNetworkForm(false)} 
          onSubmit={handleNetworkSubmit}
        />
      </Dialog>

      <section>
        <h2>Galería de Componentes (Visual)</h2>
        <ComponentGallery
          items={mockGalleryData}
          onItemSelected={handleComponentSelect}
        />
      </section>

      {/* --- BOTONES --- */}
      <section>
        <h2>Botones</h2>
        <ButtonShowcase />
      </section>

      {/* --- TIPOGRAFÍA --- */}
      <section>
        <h2>Tipografía</h2>
        <TextShowcase />
      </section>

      {/* 🚨 NUEVA SECCIÓN: DATA TABLE */}
      <section>
        <h2>Data Table (Listado)</h2>
        <DataTable
          columns={tableColumns} // Usamos la nueva definición
          data={mockTableData}
        />
      </section>

      {/* --- CAMPO DE BÚSQUEDA --- */}
      <section>
        <h2>Barra de Búsqueda</h2>
        <SearchFilterBar
          onSearchChange={setSearchTerm}
          onFilterClick={handleFilterClick}
          searchPlaceholder="Busca componentes, racks o servidores..."
        />
        <p>Término de Búsqueda Actual: <strong>{searchTerm}</strong></p>
      </section>

      {/* --- CAMPOS DE INPUT --- */}
      <section>
        <h2>Campos de Input</h2>
        <div className={styles.componentGrid}>
          <InputField label="Nombre de Usuario" placeholder="Escribe aquí..." />
          <InputField label="Máximo 20 caracteres" maxLength={20} value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
          <InputField label="Campo Deshabilitado" disabled value="Valor no editable" />
        </div>
      </section>

      {/* --- SLIDERS --- */}
      <section>
        <h2>Sliders</h2>
        <div className={styles.componentGrid}>
          <div className={styles.sliderWrapper}>
            <Slider
              min={0}
              max={100}
              value={sliderValue}
              onChange={(e) => setSliderValue(Number(e.target.value))}
            />
          </div>
          <div className={styles.sliderWrapper}>
            <Slider
              min={0}
              max={100}
              value={57}
              disabled={true}
            />
          </div>
        </div>
      </section>

      {/* --- SELECTOR DE NÚMEROS --- */}
      <section>
        <h2>Selector de Números</h2>
        <div className={styles.componentGrid}>
          <NumberSelector
            value={selectorValue}
            min={-5}
            max={5}
            onChange={setSelectorValue}
          />
        </div>
      </section>

      {/* --- TOASTS --- */}
      <section>
        <h2>Toasts</h2>
        <div className={styles.componentGrid}>
          <Button onClick={() => handleToast('info')}>Info Toast</Button>
          <Button onClick={() => handleToast('success')}>Success Toast</Button>
          <Button onClick={() => handleToast('warning')}>Warning Toast</Button>
          <Button onClick={() => handleToast('error')}>Error Toast</Button>
        </div>
      </section>
    </div>
  );
};

export default Playground;