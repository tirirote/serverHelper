import React, { useState, useEffect } from 'react';
import { Cpu, DollarSign, Server, SquareStack, Network, LayoutGrid } from 'lucide-react';
import Infopill from '../../components/ui/infopill/InfoPill.jsx'
import styles from './DashboardPage.module.css';

//API Services

import { getAllComponents } from '../../api/services/componentService.js';
import { getAllNetworks } from '../../api/services/networkService.js'
import { getAllRacks } from '../../api/services/rackService.js'
import { getAllServers } from '../../api/services/serverService.js'
import { getAllWorkspaces, getWorkspacesByName } from '../../api/services/workspaceService.js'

const initialStats = {
    totalComponents: 0,
    purchasedComponents: 0,
    totalPurchaseCost: 0,
    totalServers: 0,
    totalRacks: 0,
    totalNetworks: 0,
    totalWorkspaces: 0,
};

const DashboardPage = () => {
    // Datos simulados (sustituir por llamadas a API reales)
    const [stats, setStats] = useState(initialStats);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const formatCurrency = (amount) => {
        return amount.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
    };

    // --- Lógica de Peticiones Paralelas ---
    useEffect(() => {
        const fetchAllStats = async () => {
            setLoading(true);
            setError(null);

            try {
                const [serversArray, racksArray, networksArray, componentsArray, workspacesArray] = await Promise.all([
                    getAllServers(),
                    getAllRacks(),
                    getAllNetworks(),
                    getAllComponents(),
                    getWorkspacesByName(),
                ]);

                const serversTotal = (serversArray || []).length;
                const racksTotal = (racksArray || []).length;
                const networksTotal = (networksArray || []).length;
                const componentsTotal = (componentsArray || []).length;
                const workspacesTotal = (workspacesArray || []).length;

                setStats({
                    totalServers: serversTotal,
                    totalRacks: racksTotal,
                    totalNetworks: networksTotal,
                    totalWorkspaces: workspacesTotal,
                    totalComponents: componentsTotal,
                });

            } catch (err) {
                console.error("Error al cargar datos del Dashboard:", err);
                setError('Error al obtener una o más métricas del servidor.');
            } finally {
                setLoading(false);
            }
        };

        fetchAllStats();
    }, []); // Se ejecuta solo una vez al montar

    // --- Renderizado Condicional (Loading/Error) ---
    if (loading) {
        return (
            <div className={styles.header}>
                <h1>Cargando Dashboard... ⏳</h1>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.header}>
                <h1 style={{ color: 'red' }}>Error de Conexión ❌</h1>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div>
            <div className={styles.header}>
                <h1>
                    Overview
                </h1>
            </div>

            {/* Grid de 6 Métricas */}
            <div className={styles.overviewContainer}>

                {/* 1. Componentes en tienda */}
                <Infopill
                    label="Inventario Total"
                    value={stats.totalComponents.toLocaleString()}
                    details="Componentes en stock y vendidos"
                />

                {/* 2. Coste total de componentes comprados */}
                <Infopill
                    label="Coste Adquisición"
                    value={formatCurrency(stats.totalPurchaseCost)}
                    details={`${stats.purchasedComponents.toLocaleString()} Componentes comprados`}
                />

                {/* 3. Servidores creados */}
                <Infopill
                    label="Servidores"
                    value={stats.totalServers}
                    details="Total de servidores desplegados"
                />

                {/* 4. Racks creados */}
                <Infopill
                    label="Racks Físicos"
                    value={stats.totalRacks}
                    details="Estructuras de racks en datacenter"
                />

                {/* 5. Redes creadas */}
                <Infopill
                    label="Redes Lógicas"
                    value={stats.totalNetworks}
                    details="VPNs, VLANs y Subredes"
                />

                {/* 6. Workspaces creados */}
                <Infopill
                    label="Workspaces"
                    value={stats.totalWorkspaces}
                    details="Entornos de trabajo activos"
                />
            </div>
        </div>
    );
};

export default DashboardPage;