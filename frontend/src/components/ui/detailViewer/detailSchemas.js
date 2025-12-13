export const createWorkspaceSchema = (workspaceItem, totalRacks = 0, racksLoading = false, racksError = false) => {
  if (!workspaceItem) return null;
  const racksValue = racksLoading ? 'Cargando...' : racksError ? 'N/A (Error)' : totalRacks;
  const details = [
    { label: 'Racks', isList: true, items: (workspaceItem.racks || []).map(r => ({ name: r.name || r })) },
    { label: 'Nombre', value: workspaceItem.name },
    { label: 'Red', value: workspaceItem.network ? workspaceItem.network.name : 'N/A' },
    { label: 'Racks Totales', value: racksValue }
  ];
  return {
    name: workspaceItem.name,
    description: workspaceItem.description,
    modelPath: workspaceItem.modelPath || '',
    type: 'workspace',
    details,
    compatibilityItems: workspaceItem.compatibleWith || []
  };
};

export const createRackSchema = (rackItem, serversLoading = false, serversError = false) => {
  if (!rackItem) return null;
  const serverValue = serversLoading ? 'Cargando...' : serversError ? 'N/A (Error)' : rackItem.servers.length;
  const details = [
    { label: 'Servidores', isList: true, items: (rackItem.servers || []).map(s => ({ name: s.name || s })) },
    { label: 'Nombre', value: rackItem.name },
    { label: 'Unidades', value: rackItem.units },
    { label: 'Coste Total', value: rackItem.totalCost },
    { label: 'Mantenimiento', value: rackItem.totalMaintenanceCost },
    { label: 'Salud', value: rackItem.healthStatus },
    { label: 'Estado', value: rackItem.powerStatus }
  ];

  return {
    name: rackItem.name,
    description: rackItem.description,
    modelPath: rackItem.modelPath || '',
    type: 'rack',
    details,
    compatibilityItems: rackItem.servers || []
  };
};

export const createServerSchema = (serverItem) => {
  if (!serverItem) return null;
  const details = [
    { label: 'Componentes', isList: true, items: (serverItem.components || []).map(c => ({ name: c.name || c })) },
    { label: 'Sistema Operativo', value: serverItem.operatingSystem },
    { label: 'Rack', value: serverItem.rackName },
    { label: 'Estado', value: serverItem.status ?? serverItem.powerStatus, isStatus: true },
    { label: 'Salud', value: serverItem.healthStatus },
    { label: 'Dirección IP', value: serverItem.ipAddress },
    { label: 'Red', value: serverItem.network },
    { label: 'Coste Mantenimiento', value: serverItem.totalMaintenanceCost ? `${serverItem.totalMaintenanceCost} €/Mes` : 'N/A' },
    { label: 'Precio Total', value: serverItem.totalPrice ? `${serverItem.totalPrice} €` : 'N/A' }
  ];

  return {
    name: serverItem.name,
    description: serverItem.description || '',
    modelPath: serverItem.modelPath || '',
    type: 'server',
    details,
    compatibilityItems: []
  };
};

export const createComponentSchema = (componentItem) => {
  if (!componentItem) return null;
  const details = [
    { label: 'Tipo', value: componentItem.type || 'N/A' },
    { label: 'Precio (USD)', value: componentItem.price ? `$${componentItem.price.toFixed(2)}` : 'N/A' },
    { label: 'Consumo (W)', value: componentItem.estimatedConsumption ? `${componentItem.estimatedConsumption} W` : 'N/A' },
    { label: 'Costo Mantenimiento', value: componentItem.maintenanceCost ? `$${componentItem.maintenanceCost.toFixed(2)}` : 'N/A' }
  ];

  return {
    name: componentItem.name,
    description: componentItem.details || componentItem.description || '',
    modelPath: componentItem.modelPath || '',
    type: 'component',
    details,
    compatibilityItems: componentItem.compatibleList || componentItem.compatibleWith || []
  };
};

export const createNetworkSchema = (networkItem) => {
  if (!networkItem) return null;
  const details = [
    { label: 'Dirección Ip', value: networkItem.ipAddress || 'N/A' },
    { label: 'Máscara de Red', value: networkItem.subnetMask || 'N/A' },
    { label: 'Puerta del Enlace', value: networkItem.gateway || 'N/A' }
  ];

  return {
    name: networkItem.name,
    description: networkItem.details || networkItem.description || '',
    modelPath: networkItem.modelPath || '',
    type: 'network',
    details,
  };
};
