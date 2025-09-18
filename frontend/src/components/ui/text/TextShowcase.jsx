import React from 'react';
import styles from './TextShowcase.module.css';
import Callout from './Callout.jsx';
import Blockquote from './Blockquote.jsx';
import CodeBlock from './CodeBlock.jsx';
const TextShowcase = () => {
    return (
        <div>
            {/* Títulos y Párrafos */}
            <div>
                <h3>Títulos y Párrafos</h3>
                <div>
                    <h1>Título de Nivel 1 (h1)</h1>
                    <p>Este es un párrafo de ejemplo con la tipografía principal del cuerpo del texto. Sirve para mostrar contenido largo y detallado. Puedes usar etiquetas como <strong>texto en negrita</strong> y <em>texto en cursiva</em> para darle más énfasis a las palabras.</p>
                    <h2>Título de Nivel 2 (h2)</h2>
                    <p>Este es otro párrafo que muestra cómo se ve el texto de cuerpo.</p>
                    <h3>Título de Nivel 3 (h3)</h3>
                    <p>Los títulos de este nivel se usan para subtítulos más específicos.</p>
                    <h4>Título de Nivel 4 (h4)</h4>
                    <h5>Título de Nivel 5 (h5)</h5>
                    <h6>Título de Nivel 6 (h6)</h6>
                </div>
            </div>

            {/* Citas */}
            <div className={styles.category}>
                <h3>Citas (Blockquotes)</h3>
                <Blockquote author="Albert Einstein">
                    "El verdadero signo de la inteligencia no es el conocimiento, sino la imaginación."
                </Blockquote>
            </div>

            {/* Código */}
            <div className={styles.category}>
                <h3>Código</h3>
                <p>Para incluir código en línea, puedes usar la etiqueta <code>&lt;code&gt;</code>, como por ejemplo <code>npm install</code>.</p>
                <CodeBlock>
                    {`function sum(a, b) {
  return a + b;
}

const result = sum(5, 3);
console.log(result);`}
                </CodeBlock>
            </div>

            {/* Callouts */}
            <div className={styles.category}>
                <h3>Notas (Callouts)</h3>
                <Callout type="info">
                    <p>
                        <strong>Información:</strong> Esto es una nota informativa para llamar la atención del usuario.
                    </p>
                </Callout>
                <Callout type="warning">
                    <p>
                        <strong>Advertencia:</strong> Esta nota destaca una precaución o algo que requiere atención.
                    </p>
                </Callout>
                <Callout type="danger">
                    <p>
                        <strong>Peligro:</strong> Esta nota indica una situación potencialmente peligrosa.
                    </p>
                </Callout>
            </div>
        </div>
    );
};

export default TextShowcase;