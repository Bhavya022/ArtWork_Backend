import express from 'express';
import { 
  getGalleries, 
  getGalleryById, 
  createGallery, 
  updateGallery, 
  deleteGallery,
  addArtworkToGallery,
  removeArtworkFromGallery,
  updateArtworkOrder,
  getCuratorGalleries
} from '../controllers/galleryController.js';
import { verifyToken, isCurator } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.get('/', getGalleries);
router.get('/:id', getGalleryById);

// Protected routes
router.use(verifyToken, isCurator);

router.get('/curator/own', getCuratorGalleries);
router.post('/', createGallery);
router.put('/:id', updateGallery);
router.delete('/:id', deleteGallery);
router.post('/:id/artworks', addArtworkToGallery);
router.delete('/:id/artworks/:artwork_id', removeArtworkFromGallery);
router.put('/:id/order', updateArtworkOrder);

export default router;