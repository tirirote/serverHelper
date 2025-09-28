import { Router } from 'express';
import {
  createRack,
  getRackByName,
  getAllRacks,
  deleteRackByName,
  getRackMaintenanceCost,
  updateRack,
  addServerToRack
  
} from '../controllers/rackController.js';

const router = Router();

router.post('/', createRack);
router.delete('/:workspaceName/:name', deleteRackByName);
router.put('/:name', updateRack);
router.get('/:workspaceName', getAllRacks);
router.get('/:workspaceName/:name', getRackByName);
router.get('/:workspaceName/:name/maintenance-cost', getRackMaintenanceCost);
router.post('/add-server', addServerToRack);

export default router;