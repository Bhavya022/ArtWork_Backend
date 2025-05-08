import express from 'express';
import { 
  getCuratorAnalytics, 
  getArtistAnalytics, 
  getSiteStats 
} from '../controllers/analyticsController.js';
import { verifyToken, isArtist, isCurator } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.get('/site', getSiteStats);

// Protected routes
router.get('/curator', verifyToken, isCurator, getCuratorAnalytics);
router.get('/artist', verifyToken, isArtist, getArtistAnalytics);

export default router;