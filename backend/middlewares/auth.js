import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Middleware to verify JWT token
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access denied. No token provided.' 
    });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'artshow');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid token.' 
    });
  }
};

// Middleware to check for artist role
export const isArtist = (req, res, next) => {
  if (req.user && req.user.role === 'artist') {
    next();
  } else {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Artist role required.' 
    });
  }
};

// Middleware to check for curator role
export const isCurator = (req, res, next) => {
  if (req.user && req.user.role === 'curator') {
    next();
  } else {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Curator role required.' 
    });
  }
};

// Middleware to check for admin role
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Admin role required.' 
    });
  }
};

// Middleware to check if user is either an artist or curator
export const isArtistOrCurator = (req, res, next) => {
  if (req.user && (req.user.role === 'artist' || req.user.role === 'curator')) {
    next();
  } else {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Artist or curator role required.' 
    });
  }
};

// Middleware to check if artist is accessing their own resource
export const isOwnArtistResource = (req, res, next) => {
  const resourceUserId = parseInt(req.params.artistId || req.params.userId || req.body.artistId);
  
  if (req.user && (req.user.id === resourceUserId || req.user.role === 'admin')) {
    next();
  } else {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. You can only access your own resources.' 
    });
  }
};