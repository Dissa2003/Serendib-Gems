// cuttingRoute.js
import express from 'express';
import {
  createGemCuttingRequest,
  getAllGemCuttingRequests,
  getGemCuttingRequest,
  updateGemCuttingRequestStatus,
  deleteGemCuttingRequest,
} from '../controller/cuttingController.js';

const router = express.Router();

router.post('/', createGemCuttingRequest);
router.get('/', getAllGemCuttingRequests);
router.get('/:id', getGemCuttingRequest);
router.put('/:id/status', updateGemCuttingRequestStatus);
router.delete('/:id', deleteGemCuttingRequest);

export default router;