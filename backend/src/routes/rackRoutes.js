import { Router } from 'express';
import { 
  createRack, 
  getRackByName, 
  getAllRacks, 
  deleteRackByName,
  addServerToRack,
  getMaintenanceCost
} from '../controllers/rackController.js';

const router = Router();

router.post('/', createRack);
router.get('/:workspaceName', getAllRacks);
router.get('/:workspaceName/:name', getRackByName);
router.delete('/:workspaceName/:name', deleteRackByName);
router.get('/:workspaceName/:rackName/maintenance', getMaintenanceCost);

//Ruta de integración con servidores
router.post('/add-server', addServerToRack);

export default router;