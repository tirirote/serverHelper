import React, { useState } from 'react';
import PropTypes from 'prop-types';
import InputField from '../../ui/input/InputField.jsx';
import Button from '../../ui/button/Button.jsx';
import styles from './UserForm.module.css';
import { Eye, EyeOff } from 'lucide-react';

const UserForm = ({ onClose }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Lógica de mock para el envío del formulario de usuario
        console.log({ username, password });
        alert('Formulario de usuario enviado (mock).');
        onClose();
    };

    return (
        <div className={styles.formContainer}>
            <div className={styles.header}>
                <h2>LOGIN/SIGN UP</h2>
            </div>
            <form onSubmit={handleSubmit} className={styles.form}>
                <InputField
                    label="USERNAME"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    maxLength={30}
                    placeholder="Escribe tu nombre de usuario"
                />
                <InputField
                    label="PASSWORD"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    maxLength={30}
                    placeholder="Escribe tu contraseña"
                    type={showPassword ? "text" : "password"}
                    icon={
                        <Button
                            onClick={() => setShowPassword(!showPassword)}
                            variant="icon-only"
                        >
                            {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                        </Button>
                    }
                />
                <Button type="submit" className={styles.doneButton}>DONE</Button>
            </form>
        </div>
    );
};

UserForm.propTypes = {
    onClose: PropTypes.func.isRequired,
};

export default UserForm;