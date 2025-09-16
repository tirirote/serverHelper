import React, { useState } from 'react';
import Button from '../components/ui/button/Button.jsx';
import InputField from '../components/ui/input/InputField.jsx';
import Slider from '../components/ui/slider/Slider.jsx';
import NumberSelector from '../components/ui/numberSelector/NumberSelector.jsx';
import { useToast } from '../components/ui/toasts/ToastProvider.jsx';
import { Search, PlusCircle, Trash2 } from 'lucide-react';
import styles from './Playground.module.css';

const Playground = () => {
  const { showToast } = useToast();
  const [sliderValue, setSliderValue] = useState(50);
  const [selectorValue, setSelectorValue] = useState(1);
  const [inputValue, setInputValue] = useState('');

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
      <h1 className={styles.title}>Playground</h1>
      <p className={styles.description}>
        Aquí puedes ver y probar todos los componentes de la UI.
      </p>

      {/* --- BOTONES --- */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Botones</h2>
        <div className={styles.componentGrid}>
          <Button onClick={() => handleToast('info')}>Botón Normal</Button>
          <Button variant="danger" onClick={() => handleToast('warning')}>Botón Peligro</Button>
          <Button disabled>Botón Deshabilitado</Button>
          <Button onClick={() => handleToast('success')}>
            <Search size={24} />
          </Button>
          <Button onClick={() => handleToast('error')} disabled>
            <Trash2 size={24} />
          </Button>
        </div>
      </section>

      {/* --- CAMPOS DE INPUT --- */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Campos de Input</h2>
        <div className={styles.componentGrid}>
          <InputField label="Nombre de Usuario" placeholder="Escribe aquí..." />
          <InputField label="Máximo 20 caracteres" maxLength={20} value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
          <InputField label="Campo Deshabilitado" disabled value="Valor no editable" />
        </div>
      </section>

      {/* --- SLIDERS --- */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Sliders</h2>
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
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Selector de Números</h2>
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
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Toasts</h2>
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