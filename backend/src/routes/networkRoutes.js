// src/routes/networkRoutes.js
import { Router } from 'express';
import { 
  createNetwork, 
  deleteNetworkByName, 
  getNetworkByName, 
  getAllNetworks 
} from '../controllers/networkController.js';

const router = Router();

router.post('/', createNetwork);
router.delete('/:name', deleteNetworkByName);
router.get('/:name', getNetworkByName);
router.get('/', getAllNetworks);

export default router;