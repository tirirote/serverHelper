import { Router } from 'express';
import { 
  createUser, 
  deleteUser, 
  updateUser, 
  getAllUsers, 
  getUserByUsername 
} from '../controllers/userController.js';

const router = Router();

router.post('/', createUser);
router.get('/', getAllUsers);
router.get('/:username', getUserByUsername);
router.put('/:username', updateUser);
router.delete('/:username', deleteUser);

export default router;