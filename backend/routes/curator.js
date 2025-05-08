import express from 'express';
import { 
  getPendingArtworks, 
  reviewArtwork, 
  getTags, 
  getReviewHistory 
} from '../controllers/curatorController.js';
import { verifyToken, isCurator } from '../middlewares/auth.js';

const router = express.Router();

// All curator routes are protected
router.use(verifyToken, isCurator);

router.get('/pending', getPendingArtworks);
router.post('/review/:id', reviewArtwork);
router.get('/tags', getTags);
router.get('/history', getReviewHistory);

export default router;