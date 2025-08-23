import { Router } from 'express';
import { 
  createRack, 
  getRackByName, 
  getAllRacks, 
  deleteRackByName
} from '../controllers/rackController.js';

const router = Router();

router.post('/', createRack);
router.get('/:workspaceName', getAllRacks);
router.get('/:workspaceName/:name', getRackByName);
router.delete('/:workspaceName/:name', deleteRackByName);

export default router;