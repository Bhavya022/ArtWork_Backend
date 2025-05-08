import express from 'express';
import { 
  getArtworks, 
  getArtworkById, 
  createArtwork, 
  updateArtwork, 
  deleteArtwork,
  toggleLike
} from '../controllers/artworkController.js';
import { verifyToken, isArtist } from '../middlewares/auth.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

// Public routes
router.get('/', getArtworks);
router.get('/:id', getArtworkById);
router.post('/:id/like', toggleLike);

// Protected routes
router.post('/', verifyToken, isArtist, upload.single('image'), createArtwork);
router.put('/:id', verifyToken, isArtist, upload.single('image'), updateArtwork);
router.delete('/:id', verifyToken, isArtist, deleteArtwork);

export default router;