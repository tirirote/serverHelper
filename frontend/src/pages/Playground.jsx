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
import Dialog from '../components/ui/dialog/Dialog.jsx';
import styles from './Playground.module.css';
import ButtonShowcase from '../components/ui/button/ButtonShowcase.jsx'; // Nuevo import

const Playground = () => {
  const { showToast } = useToast();
  const [sliderValue, setSliderValue] = useState(50);
  const [selectorValue, setSelectorValue] = useState(1);
  const [inputValue, setInputValue] = useState('');
  const [showComponentForm, setShowComponentForm] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showRackForm, setShowRackForm] = useState(false); // Nuevo estado

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

      {/* --- TIPOGRAFÍA --- */}
      <section>
        <h2>Tipografía</h2>
        <div className={styles.textExamples}>
          <h1>Título de Nivel 1 (h1)</h1>
          <p>Este es un párrafo de ejemplo con la tipografía principal del cuerpo del texto. Sirve para mostrar contenido largo y detallado. Puedes usar etiquetas como <strong>texto en negrita</strong> y <em>texto en cursiva</em> para darle más énfasis a las palabras.</p>
          <h2>Título de Nivel 2 (h2)</h2>
          <p>Este es otro párrafo que muestra cómo se ve el texto de cuerpo.</p>
          <h3>Título de Nivel 3 (h3)</h3>
          <p>Los títulos de este nivel se usan para subtítulos más específicos.</p>
          <h4>Título de Nivel 4 (h4)</h4>
          <h5>Título de Nivel 5 (h5)</h5>
          <h6>Título de Nivel 6 (h6)</h6>
          <p>Texto en un <span style={{ color: 'var(--color-orange)' }}>span de color naranja</span> para destacar una palabra dentro de un párrafo.</p>
        </div>
      </section>

      {/* --- BOTONES --- */}
      <section>
        <h2>Botones</h2>
        <ButtonShowcase />
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