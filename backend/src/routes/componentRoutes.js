import { Router } from 'express';
import { 
  createComponent, 
  deleteComponent, 
  updateComponent, 
  getComponentCost, 
  getComponentCompatibleList, 
  getComponentDetails, 
  getComponentType,
  getComponentByName 
} from '../controllers/componentController.js';

const router = Router();

router.post('/', createComponent);
router.delete('/:name', deleteComponent);
router.put('/:name', updateComponent);
router.get('/:name', getComponentByName);
router.get('/:name/cost', getComponentCost);
router.get('/:name/compatible', getComponentCompatibleList);
router.get('/:name/details', getComponentDetails);
router.get('/:name/type', getComponentType);

export default router;