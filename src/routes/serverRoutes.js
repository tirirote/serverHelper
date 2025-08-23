import { Router } from 'express';
import { 
  createServer,
  deleteServerByName,
  getAllServers,
  getServerByName,
  getAllComponents,
  getMissingComponents
} from '../controllers/serverController.js';

const router = Router();

router.post('/', createServer);
router.delete('/:name', deleteServerByName);
router.get('/', getAllServers);
router.get('/:name', getServerByName);
router.get('/:name/components', getAllComponents);
router.get('/:name/missing', getMissingComponents);

export default router;