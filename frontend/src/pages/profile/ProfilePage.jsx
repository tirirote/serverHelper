import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Save, ArrowLeft, Camera, UserSquare, ChevronLeft } from 'lucide-react';
import styles from './ProfilePage.module.css';
import InputField from '../../components/ui/input/InputField';
import Button from '../../components/ui/button/Button';
import { useToast } from '../../components/ui/toasts/ToastProvider.jsx';

// Datos iniciales de simulación para el perfil
const initialProfileData = {
    displayName: 'Usuario Demo',
    email: 'usuario.demo@serverhelper.com',
    nickname: 'MasterServer',
    avatarUrl: 'https://placehold.co/100x100/4c566a/ffffff?text=U', // Placeholder inicial
    newPassword: 'samplePassword',
};

const ProfilePage = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [profileData, setProfileData] = useState(initialProfileData);
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    // Manejar la carga de la foto (Simulación)
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            console.log("Simulando carga de imagen para:", file.name);
            const newUrl = URL.createObjectURL(file);
            setProfileData(prev => ({ ...prev, avatarUrl: newUrl }));
            // 🚨 Usar showToast
            showToast('¡Avatar listo para ser aplicado! Recuerda pulsar Guardar.', 'info');
        }
    };

    // Simulación de la función de guardar
    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        // 🚨 Usar showToast para mensaje de info
        showToast('Guardando configuración de perfil...', 'info');

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Simulación de un error ocasional
            if (Math.random() < 0.1) {
                throw new Error("Error de conexión simulado.");
            }

            setProfileData(prev => ({ ...prev, newPassword: '' }));

            // 🚨 Usar showToast para mensaje de éxito
            showToast('¡Configuración guardada con éxito!', 'success');
        } catch (error) {
            console.error("Error al guardar:", error);
            // 🚨 Usar showToast para mensaje de error
            showToast(error.message || 'Error desconocido al guardar la configuración.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className={styles.profilePage}>
            <div className={styles.header}>
                <h1>Configuración de Perfil</h1>
                {/* Mensajes de estado */}
                {statusMessage.text && (
                    <div className={`${styles.status} ${styles[statusMessage.type]}`}>
                        {statusMessage.text}
                    </div>
                )}
            </div>
            <div className={styles.profileContainer} onSubmit={handleSave}>
                {/* Sección 1: Avatar y Display Name */}
                <div className={styles.avatarSection}>
                    <div className={styles.avatarContainer}>
                        <img
                            src={profileData.avatarUrl}
                            alt="Avatar de usuario"
                            className={styles.avatar}
                            onError={(e) => {
                                // Fallback a un placeholder si la URL falla
                                e.target.src = 'https://placehold.co/100x100/4c566a/ffffff?text=U';
                            }}
                        />
                        <label className={styles.avatarOverlay}>
                            <Camera size={24} />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                style={{ display: 'none' }}
                            />
                        </label>
                    </div>
                </div>

                {/* Sección 2: Credenciales */}
                <div className={styles.infoLayout}>
                    <div className={styles.inputGroup}>
                        <InputField
                            label="Username"
                            type="text"
                            value={profileData.displayName}
                            onChange={handleChange}
                            startAdornment={null}
                        />
                        <InputField
                            label="Nickname"
                            type="text"
                            value={profileData.nickname}
                            onChange={handleChange}
                            startAdornment={null}
                        />
                        <InputField
                            label="Email"
                            type="text"
                            value={profileData.email}
                            onChange={handleChange}
                            startAdornment={<Mail size={20} />}
                        />
                        <InputField
                            label="Password"
                            type="text"
                            value={profileData.newPassword}
                            onChange={handleChange}
                            startAdornment={<Lock size={20} />}
                        />
                    </div>
                    {/* Botones de acción */}
                    <div className={styles.buttonGroup}>
                        <Button
                            variant="primary"
                            onClick={() => navigate('/dashboard')}>
                            <ChevronLeft size={20} />
                            Volver
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => navigate('/dashboard')}>
                            <Save size={20} />
                            Guardar
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
