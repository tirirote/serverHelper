import { Router } from 'express';
import {
  createWorkspace,
  getWorkspaceByName,
  getAllWorkspaces,
  getAllCurrentRacks,
  updateWorkspace,
  deleteWorkspaceByName,
  addRackToWorkspace
} from '../controllers/workspaceController.js';

const router = Router();

router.post('/', createWorkspace);
router.delete('/:name', deleteWorkspaceByName);
router.put('/:name', updateWorkspace);
router.get('/', getAllWorkspaces);
router.get('/:name', getWorkspaceByName);
router.get('/:name/racks', getAllCurrentRacks);
router.post('/add-rack', addRackToWorkspace);

export default router;