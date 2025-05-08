import pool from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get all artworks with filters
export const getArtworks = async (req, res) => {
  try {
    const { status, artist_id, tag, medium, search, limit = 10, offset = 0 } = req.query;
    
    let query = `
      SELECT a.*, u.username as artist_name, 
      GROUP_CONCAT(DISTINCT t.name) as tags
      FROM artworks a
      JOIN users u ON a.artist_id = u.id
      LEFT JOIN artwork_tags at ON a.id = at.artwork_id
      LEFT JOIN tags t ON at.tag_id = t.id
    `;
    
    const queryParams = [];
    const conditions = [];
    
    // Add filters
    if (status) {
      conditions.push('a.status = ?');
      queryParams.push(status);
    }
    
    if (artist_id) {
      conditions.push('a.artist_id = ?');
      queryParams.push(artist_id);
    }
    
    if (tag) {
      conditions.push('t.name = ?');
      queryParams.push(tag);
    }
    
    if (medium) {
      conditions.push('a.medium = ?');
      queryParams.push(medium);
    }
    
    if (search) {
      conditions.push('(a.title LIKE ? OR a.description LIKE ? OR u.username LIKE ?)');
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }
    
    // If not logged in or not a curator, only show approved artworks
    if (!req.user || req.user.role !== 'curator') {
      conditions.push('a.status = ?');
      queryParams.push('approved');
    }
    
    if (conditions.length) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' GROUP BY a.id';
    query += ' ORDER BY a.created_at DESC';
    query += ' LIMIT ? OFFSET ?';
    
    queryParams.push(parseInt(limit), parseInt(offset));
    
    const [artworks] = await pool.query(query, queryParams);
    
    // Count total artworks for pagination
    let countQuery = `
      SELECT COUNT(DISTINCT a.id) as total
      FROM artworks a
      JOIN users u ON a.artist_id = u.id
      LEFT JOIN artwork_tags at ON a.id = at.artwork_id
      LEFT JOIN tags t ON at.tag_id = t.id
    `;
    
    if (conditions.length) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
    }
    
    const [countResult] = await pool.query(countQuery, queryParams.slice(0, -2));
    const total = countResult[0].total;
    
    return res.status(200).json({
      success: true,
      data: {
        artworks,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: parseInt(offset) + parseInt(limit) < total
        }
      }
    });
  } catch (error) {
    console.error('Get artworks error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve artworks',
      error: error.message
    });
  }
};

// Get artwork by ID
export const getArtworkById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Increment view count
    await pool.query('UPDATE artworks SET view_count = view_count + 1 WHERE id = ?', [id]);
    
    const [artworks] = await pool.query(`
      SELECT a.*, u.username as artist_name, u.profile_image as artist_image, u.bio as artist_bio,
      GROUP_CONCAT(DISTINCT t.name) as tags
      FROM artworks a
      JOIN users u ON a.artist_id = u.id
      LEFT JOIN artwork_tags at ON a.id = at.artwork_id
      LEFT JOIN tags t ON at.tag_id = t.id
      WHERE a.id = ?
      GROUP BY a.id
    `, [id]);
    
    if (artworks.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Artwork not found'
      });
    }
    
    const artwork = artworks[0];
    
    // If not curator and artwork is not approved, don't allow access
    if ((!req.user || req.user.role !== 'curator') && 
        artwork.status !== 'approved' &&
        (!req.user || req.user.id !== artwork.artist_id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Artwork is not approved.'
      });
    }
    
    // Format tags
    if (artwork.tags) {
      artwork.tags = artwork.tags.split(',');
    } else {
      artwork.tags = [];
    }
    
    return res.status(200).json({
      success: true,
      data: artwork
    });
  } catch (error) {
    console.error('Get artwork error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve artwork',
      error: error.message
    });
  }
};

// Create new artwork
export const createArtwork = async (req, res) => {
  try {
    const { title, description, medium, dimensions } = req.body;
    const artistId = req.user.id;
    
    // Validate required fields
    if (!title || !medium) {
      return res.status(400).json({
        success: false,
        message: 'Title and medium are required'
      });
    }
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image file is required'
      });
    }
    
    const imageUrl = `/uploads/${req.file.filename}`;
    
    // Insert artwork
    const [result] = await pool.query(`
      INSERT INTO artworks (title, description, medium, dimensions, image_url, artist_id, status)
      VALUES (?, ?, ?, ?, ?, ?, 'pending')
    `, [title, description, medium, dimensions, imageUrl, artistId]);
    
    const artworkId = result.insertId;
    
    return res.status(201).json({
      success: true,
      message: 'Artwork submitted successfully',
      data: {
        id: artworkId,
        title,
        description,
        medium,
        dimensions,
        image_url: imageUrl,
        artist_id: artistId,
        status: 'pending',
        created_at: new Date()
      }
    });
  } catch (error) {
    console.error('Create artwork error:', error);
    
    // Delete uploaded file if it exists
    if (req.file) {
      const filePath = path.join(__dirname, '../../', req.file.path);
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Failed to submit artwork',
      error: error.message
    });
  }
};

// Update artwork (for artist)
export const updateArtwork = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, medium, dimensions } = req.body;
    const artistId = req.user.id;
    
    // Check if artwork exists and belongs to this artist
    const [artworks] = await pool.query(
      'SELECT * FROM artworks WHERE id = ?',
      [id]
    );
    
    if (artworks.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Artwork not found'
      });
    }
    
    const artwork = artworks[0];
    
    // Ensure artwork belongs to the current artist
    if (artwork.artist_id !== artistId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own artworks.'
      });
    }
    
    // Only allow updating pending artworks
    if (artwork.status !== 'pending' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only pending artworks can be updated'
      });
    }
    
    // Build update query dynamically
    let updateQuery = 'UPDATE artworks SET ';
    const updateValues = [];
    const updateFields = [];
    
    if (title) {
      updateFields.push('title = ?');
      updateValues.push(title);
    }
    
    if (description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(description);
    }
    
    if (medium) {
      updateFields.push('medium = ?');
      updateValues.push(medium);
    }
    
    if (dimensions !== undefined) {
      updateFields.push('dimensions = ?');
      updateValues.push(dimensions);
    }
    
    // If a new image was uploaded
    if (req.file) {
      updateFields.push('image_url = ?');
      updateValues.push(`/uploads/${req.file.filename}`);
      
      // Delete old image file if it exists
      if (artwork.image_url) {
        const oldFilePath = path.join(__dirname, '../../', artwork.image_url.replace(/^\//, ''));
        fs.unlink(oldFilePath, (err) => {
          if (err && err.code !== 'ENOENT') console.error('Error deleting old file:', err);
        });
      }
    }
    
    // If status was changed back to pending after rejection
    if (artwork.status === 'rejected') {
      updateFields.push('status = ?');
      updateValues.push('pending');
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }
    
    updateQuery += updateFields.join(', ');
    updateQuery += ' WHERE id = ?';
    updateValues.push(id);
    
    // Update artwork
    await pool.query(updateQuery, updateValues);
    
    // Get updated artwork
    const [updatedArtworks] = await pool.query(
      'SELECT * FROM artworks WHERE id = ?',
      [id]
    );
    
    return res.status(200).json({
      success: true,
      message: 'Artwork updated successfully',
      data: updatedArtworks[0]
    });
  } catch (error) {
    console.error('Update artwork error:', error);
    
    // Delete uploaded file if it exists
    if (req.file) {
      const filePath = path.join(__dirname, '../../', req.file.path);
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Failed to update artwork',
      error: error.message
    });
  }
};

// Delete artwork
export const deleteArtwork = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Check if artwork exists and belongs to this artist
    const [artworks] = await pool.query(
      'SELECT * FROM artworks WHERE id = ?',
      [id]
    );
    
    if (artworks.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Artwork not found'
      });
    }
    
    const artwork = artworks[0];
    
    // Ensure artwork belongs to the current artist or user is admin
    if (artwork.artist_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own artworks.'
      });
    }
    
    // Delete artwork from database
    await pool.query('DELETE FROM artworks WHERE id = ?', [id]);
    
    // Delete image file if it exists
    if (artwork.image_url) {
      const filePath = path.join(__dirname, '../../', artwork.image_url.replace(/^\//, ''));
      fs.unlink(filePath, (err) => {
        if (err && err.code !== 'ENOENT') console.error('Error deleting file:', err);
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Artwork deleted successfully'
    });
  } catch (error) {
    console.error('Delete artwork error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete artwork',
      error: error.message
    });
  }
};

// Like/unlike artwork
export const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if artwork exists
    const [artworks] = await pool.query(
      'SELECT * FROM artworks WHERE id = ?',
      [id]
    );
    
    if (artworks.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Artwork not found'
      });
    }
    
    // Increment like count
    await pool.query(
      'UPDATE artworks SET like_count = like_count + 1 WHERE id = ?',
      [id]
    );
    
    return res.status(200).json({
      success: true,
      message: 'Artwork liked successfully'
    });
  } catch (error) {
    console.error('Like artwork error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to like artwork',
      error: error.message
    });
  }
};