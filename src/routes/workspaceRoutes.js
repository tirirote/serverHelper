import { Router } from 'express';
import { 
  createWorkspace, 
  getWorkspaceByName, 
  getAllWorkspaces, 
  getAllCurrentRacks 
} from '../controllers/workspaceController.js';

const router = Router();

router.post('/', createWorkspace);
router.get('/', getAllWorkspaces);
router.get('/:name', getWorkspaceByName);
router.get('/:name/racks', getAllCurrentRacks);

export default router;