import { Router } from 'express';
import { 
  createComponent, 
  deleteComponent, 
  updateComponent, 
  getComponentPrice, 
  getComponentCompatibleList, 
  getComponentDetails, 
  getComponentType,
  getComponentByName,
  getComponentMaintenanceCost,
  getComponentModelPath
} from '../controllers/componentController.js';

const router = Router();

router.post('/', createComponent);
router.delete('/:name', deleteComponent);
router.put('/:name', updateComponent);
router.get('/:name', getComponentByName);
router.get('/:name/price', getComponentPrice);
router.get('/:name/compatible', getComponentCompatibleList);
router.get('/:name/details', getComponentDetails);
router.get('/:name/type', getComponentType);
router.get('/:name/maintenance-cost', getComponentMaintenanceCost);
router.get('/:name/model-path', getComponentModelPath);

export default router;