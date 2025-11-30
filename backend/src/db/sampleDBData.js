// src/backend/sampleDBData.js

import { powerStatus, healthStatus } from '../schemas/types.js'

// Función auxiliar para obtener la referencia de un componente por nombre
const getComponentRef = (name) => {
    const comp = sampleComponents.find(c => c.name === name);
    return { name: comp.name, type: comp.type };
};

// --- 1. DATOS DE COMPONENTES (Para alimentar los servidores) ---
const sampleComponents = [
    // Componentes obligatorios (ejemplo de un set completo para un servidor)
    { type: 'CPU', name: 'Intel Xeon E5', price: 500, maintenanceCost: 5, estimatedConsumption: 120, isSelled: false, modelPath: '/assets/models/cpu.glb', details: 'CPU de alto rendimiento.' },
    { type: 'RAM', name: 'DDR4 ECC 32GB', price: 150, maintenanceCost: 1, estimatedConsumption: 5, isSelled: false, modelPath: '/assets/models/ram.glb', details: 'Memoria de servidor.' },
    { type: 'HardDisk', name: 'SSD 1TB Enterprise', price: 100, maintenanceCost: 2, estimatedConsumption: 10, isSelled: false, modelPath: '/assets/models/ssd.glb', details: 'Almacenamiento rápido.' },
    { type: 'BiosConfig', name: 'BIOS v4.1', price: 5, maintenanceCost: 0, estimatedConsumption: 1, isSelled: false, modelPath: '/assets/models/os.glb', details: 'Configuración inicial.' },
    { type: 'Fan', name: 'Cooler Master R5', price: 20, maintenanceCost: 0.5, estimatedConsumption: 5, isSelled: false, modelPath: '/assets/models/fan.glb', details: 'Ventilador principal.' },
    { type: 'PowerSupply', name: 'PSU 1000W Platinum', price: 200, maintenanceCost: 3, estimatedConsumption: 0, isSelled: false, modelPath: '/assets/models/psu.glb', details: 'Fuente de alimentación.' },
    { type: 'ServerChasis', name: 'Rack 1U Chassis', price: 300, maintenanceCost: 4, estimatedConsumption: 5, isSelled: false, modelPath: '/assets/models/server-closed.glb', details: 'Chasis físico del servidor.' },
    { type: 'NetworkInterface', name: '10G NIC SFP+', price: 150, maintenanceCost: 1, estimatedConsumption: 5, isSelled: false, modelPath: '/assets/models/ni.glb', details: 'Tarjeta de red 10G.' },
    { type: 'OS', name: 'Ubuntu Server 22.04', price: 0, maintenanceCost: 1.5, estimatedConsumption: 0, isSelled: false, modelPath: '/assets/models/os.glb', details: 'Sistema Operativo.' },
    { type: 'GPU', name: 'NVIDIA A100', price: 5000, maintenanceCost: 15, estimatedConsumption: 300, isSelled: false, modelPath: '/assets/models/gpu.glb', details: 'GPU para IA/Cálculo.' },
];

// --- 2. DATOS DE REDES ---
const sampleNetworks = [
    { name: 'NET_PROD_1', ipAddress: '192.168.1.1', subnetMask: '192.168.1.0/24', gateway: '192.168.1.254' },
    { name: 'NET_DEV_2', ipAddress: '10.0.0.1', subnetMask: '10.0.0.0/8', gateway: '10.0.0.254' },
];

// --- 3. DATOS DE WORKSPACES ---
const sampleWorkspaces = [
    { name: 'Workspace Europe', description: 'Infraestructura de producción en EU.', network: 'NET_PROD_1' },
    { name: 'Workspace Asia', description: 'Entornos de desarrollo y testing.', network: 'NET_DEV_2' },
];

// --- 4. DATOS DE RACKS ---
const sampleRacks = [
    {
        name: 'RACK_EU_01',
        description: 'Rack principal de servidores web.',
        units: 42,
        totalMaintenanceCost: 150,
        workspaceName: 'Workspace Europe', // Relación con un Workspace
        healthStatus: healthStatus[0], // Excellent
        powerStatus: powerStatus[0]     // On
    },
];

// --- 5. DATOS DE SERVIDORES ---
const serverComponents1 = [
    getComponentRef('Intel Xeon E5'),
    getComponentRef('DDR4 ECC 32GB'),
    getComponentRef('SSD 1TB Enterprise'),
    getComponentRef('BIOS v4.1'),
    getComponentRef('Cooler Master R5'),
    getComponentRef('PSU 1000W Platinum'),
    getComponentRef('Rack 1U Chassis'),
    getComponentRef('10G NIC SFP+'),
    getComponentRef('Ubuntu Server 22.04'),
];
const sampleServers = [
    {
        name: 'Web Server Prod EU',
        description: 'Servidor principal para la web en Europa.',
        components: serverComponents1,
        totalPrice: 0,
        totalMaintenanceCost: 0,
        healthStatus: healthStatus[0], // Excellent
        network: 'NET_PROD_1',
        ipAddress: '192.168.1.101',
        operatingSystem: 'Ubuntu Server 22.04'
    },
    {
        name: 'DB Cluster US',
        description: 'Cluster de base de datos de alto rendimiento.',
        components: [
            ...serverComponents1.slice(0, -1), // Todos menos el OS (para variar)
            getComponentRef('NVIDIA A100'), // Añadimos una GPU
        ],
        totalPrice: 1375 + 5000 - 0, // Ajuste de precio
        totalMaintenanceCost: 18.5 + 15 - 1.5, // Ajuste de costo
        healthStatus: healthStatus[1], // Warning
        network: 'NET_DEV_2',
        ipAddress: '10.0.0.10',
        operatingSystem: 'No OS' // El campo es opcional y se permite ''
    }
];

// --- 6. DATOS DE USUARIOS ---
const sampleUsers = [
    { username: 'adminuser', password: 'password123' },
    { username: 'testdev', password: 'devpass456' }
];


// Exportación final
export const initialDBData = {
    users: sampleUsers,
    workspaces: sampleWorkspaces,
    racks: sampleRacks,
    servers: sampleServers,
    components: sampleComponents,
    networks: sampleNetworks
};