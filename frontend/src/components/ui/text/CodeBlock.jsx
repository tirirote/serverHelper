import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './CodeBlock.module.css';
import { Copy, Check } from 'lucide-react';

const CodeBlock = ({ children }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(children);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // Resetear el estado después de 2 segundos
        } catch (err) {
            console.error('Error al copiar el código: ', err);
        }
    };

    return (
        <div className={styles.codeContainer}>
            <button onClick={handleCopy} className={styles.copyButton}>
                {copied ? <Check size={24} /> : <Copy size={24} />}
            </button>
            <pre className={styles.codeBlock}>
                <code>
                    {children}
                </code>
            </pre>
        </div>
    );
};

CodeBlock.propTypes = {
    children: PropTypes.node.isRequired,
};

export default CodeBlock;