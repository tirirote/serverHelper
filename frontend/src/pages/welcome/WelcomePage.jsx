import React from 'react';
import Button from '../../components/ui/button/Button.jsx';
import { Github, Server } from 'lucide-react'; // Íconos para la sección central
import styles from './Welcome.module.css';

const WelcomePage = ({ onLoginSuccess }) => { 
    
    const handleLogin = () => {
        if (onLoginSuccess) {
            onLoginSuccess(); 
        }
    };

    const handleSignUp = () => {
        alert("Navegando a la página de Sign Up. ¡Bienvenido!");
    };

    return (
        <div className={styles.welcomeLayout}>
            
            {/* BARRA SUPERIOR (Navbar) */}
            <nav className={styles.navbar}>
                <div className={styles.logo}>[LOGO]</div>
                <div className={styles.authActions}>
                    <Button 
                        variant="secondary" 
                        onClick={handleSignUp}
                        className={styles.navButton}
                    >
                        Sign Up
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={handleLogin}
                        className={styles.navButton}
                    >
                        Login
                    </Button>
                </div>
            </nav>

            {/* CONTENIDO CENTRAL */}
            <div className={styles.contentContainer}>
                <div className={styles.contentBox}>
                    
                    <h1 className={styles.title}>SERVER HELPER</h1>
                    <hr className={styles.titleDivider} />
                    
                    <p className={styles.tagline}>
                        Gestión eficiente, visualización 3D y control total de tu infraestructura tecnológica.
                    </p>
                    
                    {/* Sección Visual: Modelo 3D y Repo */}
                    <div className={styles.visualSection}>
                        
                        <div className={styles.visualItem}>
                            {/* Simulación del Modelo 3D del servidor */}
                            <Server size={64} className={styles.serverIcon} />
                            <p className={styles.itemLabel}>RANDOM SERVER 3D MODEL</p>
                        </div>

                        <div className={styles.visualText}>
                             <p>
                                Una plataforma centralizada para administrar, visualizar y configurar todos los componentes de tu servidor y la red subyacente. 
                                Conoce tu inventario como nunca antes.
                            </p>
                        </div>
                        
                        <div className={styles.visualItem}>
                            {/* Simulación del enlace a GitHub */}
                            <Github size={64} className={styles.githubIcon} />
                            <p className={styles.itemLabel}>GITHUB REPO</p>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default WelcomePage;