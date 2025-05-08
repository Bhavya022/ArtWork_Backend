import pool from '../config/database.js';

// Get all published galleries
export const getGalleries = async (req, res) => {
  try {
    const { curator_id, tag, search, limit = 10, offset = 0 } = req.query;
    
    let query = `
      SELECT g.*, u.username as curator_name, 
      COUNT(DISTINCT ga.artwork_id) as artwork_count,
      GROUP_CONCAT(DISTINCT t.name) as tags
      FROM galleries g
      JOIN users u ON g.curator_id = u.id
      LEFT JOIN gallery_artworks ga ON g.id = ga.gallery_id
      LEFT JOIN artworks a ON ga.artwork_id = a.id
      LEFT JOIN artwork_tags at ON a.id = at.artwork_id
      LEFT JOIN tags t ON at.tag_id = t.id
    `;
    
    const queryParams = [];
    const conditions = ['g.is_published = 1'];
    
    // Add filters
    if (curator_id) {
      conditions.push('g.curator_id = ?');
      queryParams.push(curator_id);
    }
    
    if (tag) {
      conditions.push('t.name = ?');
      queryParams.push(tag);
    }
    
    if (search) {
      conditions.push('(g.name LIKE ? OR g.description LIKE ? OR u.username LIKE ?)');
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }
    
    if (conditions.length) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' GROUP BY g.id';
    query += ' ORDER BY g.created_at DESC';
    query += ' LIMIT ? OFFSET ?';
    
    queryParams.push(parseInt(limit), parseInt(offset));
    
    const [galleries] = await pool.query(query, queryParams);
    
    // Count total galleries for pagination
    let countQuery = `
      SELECT COUNT(DISTINCT g.id) as total
      FROM galleries g
      JOIN users u ON g.curator_id = u.id
      LEFT JOIN gallery_artworks ga ON g.id = ga.gallery_id
      LEFT JOIN artworks a ON ga.artwork_id = a.id
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
        galleries,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: parseInt(offset) + parseInt(limit) < total
        }
      }
    });
  } catch (error) {
    console.error('Get galleries error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve galleries',
      error: error.message
    });
  }
};

// Get curator's galleries (both published and drafts)
export const getCuratorGalleries = async (req, res) => {
  try {
    const curatorId = req.user.id;
    const { limit = 10, offset = 0 } = req.query;
    
    const query = `
      SELECT g.*, 
      COUNT(DISTINCT ga.artwork_id) as artwork_count
      FROM galleries g
      LEFT JOIN gallery_artworks ga ON g.id = ga.gallery_id
      WHERE g.curator_id = ?
      GROUP BY g.id
      ORDER BY g.updated_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const [galleries] = await pool.query(query, [curatorId, parseInt(limit), parseInt(offset)]);
    
    // Count total galleries for pagination
    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM galleries WHERE curator_id = ?',
      [curatorId]
    );
    const total = countResult[0].total;
    
    return res.status(200).json({
      success: true,
      data: {
        galleries,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: parseInt(offset) + parseInt(limit) < total
        }
      }
    });
  } catch (error) {
    console.error('Get curator galleries error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve curator galleries',
      error: error.message
    });
  }
};

// Get gallery by ID with artworks
export const getGalleryById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Increment view count
    await pool.query('UPDATE galleries SET view_count = view_count + 1 WHERE id = ?', [id]);
    
    const [galleries] = await pool.query(`
      SELECT g.*, u.username as curator_name, u.profile_image as curator_image, u.bio as curator_bio
      FROM galleries g
      JOIN users u ON g.curator_id = u.id
      WHERE g.id = ?
    `, [id]);
    
    if (galleries.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Gallery not found'
      });
    }
    
    const gallery = galleries[0];
    
    // If gallery is not published and user is not the curator, don't allow access
    if (!gallery.is_published && (!req.user || req.user.id !== gallery.curator_id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Gallery is not published.'
      });
    }
    
    // Get artworks in this gallery
    const [artworks] = await pool.query(`
      SELECT a.*, u.username as artist_name, ga.display_order,
      GROUP_CONCAT(DISTINCT t.name) as tags
      FROM gallery_artworks ga
      JOIN artworks a ON ga.artwork_id = a.id
      JOIN users u ON a.artist_id = u.id
      LEFT JOIN artwork_tags at ON a.id = at.artwork_id
      LEFT JOIN tags t ON at.tag_id = t.id
      WHERE ga.gallery_id = ?
      GROUP BY a.id
      ORDER BY ga.display_order
    `, [id]);
    
    // Format tags for each artwork
    artworks.forEach(artwork => {
      if (artwork.tags) {
        artwork.tags = artwork.tags.split(',');
      } else {
        artwork.tags = [];
      }
    });
    
    gallery.artworks = artworks;
    
    return res.status(200).json({
      success: true,
      data: gallery
    });
  } catch (error) {
    console.error('Get gallery error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve gallery',
      error: error.message
    });
  }
};

// Create new gallery
export const createGallery = async (req, res) => {
  try {
    const { name, description } = req.body;
    const curatorId = req.user.id;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Gallery name is required'
      });
    }
    
    // Insert gallery
    const [result] = await pool.query(`
      INSERT INTO galleries (name, description, curator_id, is_published)
      VALUES (?, ?, ?, false)
    `, [name, description || null, curatorId]);
    
    const galleryId = result.insertId;
    
    return res.status(201).json({
      success: true,
      message: 'Gallery created successfully',
      data: {
        id: galleryId,
        name,
        description: description || null,
        curator_id: curatorId,
        is_published: false,
        view_count: 0,
        created_at: new Date()
      }
    });
  } catch (error) {
    console.error('Create gallery error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create gallery',
      error: error.message
    });
  }
};

// Update gallery
export const updateGallery = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, is_published } = req.body;
    const curatorId = req.user.id;
    
    // Check if gallery exists and belongs to this curator
    const [galleries] = await pool.query(
      'SELECT * FROM galleries WHERE id = ?',
      [id]
    );
    
    if (galleries.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Gallery not found'
      });
    }
    
    const gallery = galleries[0];
    
    // Ensure gallery belongs to the current curator
    if (gallery.curator_id !== curatorId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own galleries.'
      });
    }
    
    // Build update query dynamically
    let updateQuery = 'UPDATE galleries SET ';
    const updateValues = [];
    const updateFields = [];
    
    if (name) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }
    
    if (description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(description);
    }
    
    if (is_published !== undefined) {
      // Only allow publishing if gallery has artworks
      if (is_published) {
        const [artworkCount] = await pool.query(
          'SELECT COUNT(*) as count FROM gallery_artworks WHERE gallery_id = ?',
          [id]
        );
        
        if (artworkCount[0].count === 0) {
          return res.status(400).json({
            success: false,
            message: 'Cannot publish empty gallery. Add artworks first.'
          });
        }
      }
      
      updateFields.push('is_published = ?');
      updateValues.push(is_published ? 1 : 0);
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
    
    // Update gallery
    await pool.query(updateQuery, updateValues);
    
    // Get updated gallery
    const [updatedGalleries] = await pool.query(
      'SELECT * FROM galleries WHERE id = ?',
      [id]
    );
    
    return res.status(200).json({
      success: true,
      message: 'Gallery updated successfully',
      data: updatedGalleries[0]
    });
  } catch (error) {
    console.error('Update gallery error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update gallery',
      error: error.message
    });
  }
};

// Delete gallery
export const deleteGallery = async (req, res) => {
  try {
    const { id } = req.params;
    const curatorId = req.user.id;
    
    // Check if gallery exists and belongs to this curator
    const [galleries] = await pool.query(
      'SELECT * FROM galleries WHERE id = ?',
      [id]
    );
    
    if (galleries.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Gallery not found'
      });
    }
    
    const gallery = galleries[0];
    
    // Ensure gallery belongs to the current curator
    if (gallery.curator_id !== curatorId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own galleries.'
      });
    }
    
    // Delete gallery from database
    await pool.query('DELETE FROM galleries WHERE id = ?', [id]);
    
    return res.status(200).json({
      success: true,
      message: 'Gallery deleted successfully'
    });
  } catch (error) {
    console.error('Delete gallery error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete gallery',
      error: error.message
    });
  }
};

// Add artwork to gallery
export const addArtworkToGallery = async (req, res) => {
  try {
    const { id } = req.params;
    const { artwork_id, display_order } = req.body;
    const curatorId = req.user.id;
    
    // Validate required fields
    if (!artwork_id) {
      return res.status(400).json({
        success: false,
        message: 'Artwork ID is required'
      });
    }
    
    // Check if gallery exists and belongs to this curator
    const [galleries] = await pool.query(
      'SELECT * FROM galleries WHERE id = ?',
      [id]
    );
    
    if (galleries.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Gallery not found'
      });
    }
    
    const gallery = galleries[0];
    
    // Ensure gallery belongs to the current curator
    if (gallery.curator_id !== curatorId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only modify your own galleries.'
      });
    }
    
    // Check if artwork exists and is approved
    const [artworks] = await pool.query(
      'SELECT * FROM artworks WHERE id = ? AND status = "approved"',
      [artwork_id]
    );
    
    if (artworks.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Artwork not found or not approved'
      });
    }
    
    // Check if artwork is already in gallery
    const [existing] = await pool.query(
      'SELECT * FROM gallery_artworks WHERE gallery_id = ? AND artwork_id = ?',
      [id, artwork_id]
    );
    
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Artwork is already in this gallery'
      });
    }
    
    // Get max display order if none provided
    let order = display_order;
    if (!order) {
      const [maxOrder] = await pool.query(
        'SELECT MAX(display_order) as max_order FROM gallery_artworks WHERE gallery_id = ?',
        [id]
      );
      order = (maxOrder[0].max_order || 0) + 1;
    }
    
    // Add artwork to gallery
    await pool.query(
      'INSERT INTO gallery_artworks (gallery_id, artwork_id, display_order) VALUES (?, ?, ?)',
      [id, artwork_id, order]
    );
    
    return res.status(200).json({
      success: true,
      message: 'Artwork added to gallery successfully',
      data: {
        gallery_id: parseInt(id),
        artwork_id: parseInt(artwork_id),
        display_order: order
      }
    });
  } catch (error) {
    console.error('Add artwork to gallery error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add artwork to gallery',
      error: error.message
    });
  }
};

// Remove artwork from gallery
export const removeArtworkFromGallery = async (req, res) => {
  try {
    const { id, artwork_id } = req.params;
    const curatorId = req.user.id;
    
    // Check if gallery exists and belongs to this curator
    const [galleries] = await pool.query(
      'SELECT * FROM galleries WHERE id = ?',
      [id]
    );
    
    if (galleries.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Gallery not found'
      });
    }
    
    const gallery = galleries[0];
    
    // Ensure gallery belongs to the current curator
    if (gallery.curator_id !== curatorId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only modify your own galleries.'
      });
    }
    
    // Remove artwork from gallery
    await pool.query(
      'DELETE FROM gallery_artworks WHERE gallery_id = ? AND artwork_id = ?',
      [id, artwork_id]
    );
    
    return res.status(200).json({
      success: true,
      message: 'Artwork removed from gallery successfully'
    });
  } catch (error) {
    console.error('Remove artwork from gallery error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to remove artwork from gallery',
      error: error.message
    });
  }
};

// Update artwork display order in gallery
export const updateArtworkOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { artwork_orders } = req.body;
    const curatorId = req.user.id;
    
    // Validate input
    if (!artwork_orders || !Array.isArray(artwork_orders)) {
      return res.status(400).json({
        success: false,
        message: 'artwork_orders array is required'
      });
    }
    
    // Check if gallery exists and belongs to this curator
    const [galleries] = await pool.query(
      'SELECT * FROM galleries WHERE id = ?',
      [id]
    );
    
    if (galleries.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Gallery not found'
      });
    }
    
    const gallery = galleries[0];
    
    // Ensure gallery belongs to the current curator
    if (gallery.curator_id !== curatorId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only modify your own galleries.'
      });
    }
    
    // Update each artwork's display order
    for (const item of artwork_orders) {
      if (!item.artwork_id || item.display_order === undefined) {
        continue;
      }
      
      await pool.query(
        'UPDATE gallery_artworks SET display_order = ? WHERE gallery_id = ? AND artwork_id = ?',
        [item.display_order, id, item.artwork_id]
      );
    }
    
    return res.status(200).json({
      success: true,
      message: 'Artwork order updated successfully'
    });
  } catch (error) {
    console.error('Update artwork order error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update artwork order',
      error: error.message
    });
  }
};