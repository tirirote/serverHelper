import { users } from './userData.js';
import { workspaces } from './workspaceData.js';
import { racks } from './rackData.js';
import { servers } from './serverData.js';
import { components } from './componentData.js';

export const db = {
    users,
    workspaces,
    racks,
    servers,
    components,
};

export const componentTypes = [
  'CPU',
  'RAM',
  'Chasis',
  'HardDisk',
  'BiosConfig',
  'Fan',
  'PowerSupply',
  'Placa Base',
  'ServerChasis',
  'NetworkInterface',
  'OS',
  'UPS',
];

export const mandatoryComponentTypes = [
  'CPU',
  'RAM',
  'Chasis',
  'HardDisk',
  'BiosConfig',
  'Fan',
  'PowerSupply',
  'ServerChasis',
  'NetworkInterface',
  'OS',
];