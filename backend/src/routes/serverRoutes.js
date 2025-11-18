import { Router } from 'express';
import { 
  createServer,
  deleteServerByName,
  getAllServers,
  getServerByName,
  getAllComponents,
  getMissingComponents,
  getServerTotalCost,
  getServerMaintenanceCost,
  updateServer,
  addComponentToServer
} from '../controllers/serverController.js';

const router = Router();

router.post('/', createServer);
router.delete('/:name', deleteServerByName);
router.put('/:name', updateServer);
router.get('/', getAllServers);
router.get('/:name', getServerByName);
router.get('/:name/components', getAllComponents);
router.get('/:name/missing', getMissingComponents);
router.get('/:name/total-cost', getServerTotalCost);
router.get('/:name/maintenance-cost', getServerMaintenanceCost);
router.post('/add-component', addComponentToServer);

export default router;