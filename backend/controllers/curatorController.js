import pool from '../config/database.js';

// Get all pending artworks for review
export const getPendingArtworks = async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;
    
    const query = `
      SELECT a.*, u.username as artist_name, 
      GROUP_CONCAT(DISTINCT t.name) as tags
      FROM artworks a
      JOIN users u ON a.artist_id = u.id
      LEFT JOIN artwork_tags at ON a.id = at.artwork_id
      LEFT JOIN tags t ON at.tag_id = t.id
      WHERE a.status = 'pending'
      GROUP BY a.id
      ORDER BY a.created_at ASC
      LIMIT ? OFFSET ?
    `;
    
    const [artworks] = await pool.query(query, [parseInt(limit), parseInt(offset)]);
    
    // Count total pending artworks for pagination
    const [countResult] = await pool.query('SELECT COUNT(*) as total FROM artworks WHERE status = "pending"');
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
    console.error('Get pending artworks error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve pending artworks',
      error: error.message
    });
  }
};

// Review artwork
export const reviewArtwork = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, feedback, tags } = req.body;
    const curatorId = req.user.id;
    
    // Validate status
    if (status !== 'approved' && status !== 'rejected') {
      return res.status(400).json({
        success: false,
        message: 'Status must be either "approved" or "rejected"'
      });
    }
    
    // Check if artwork exists and is pending
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
    
    if (artwork.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'This artwork has already been reviewed'
      });
    }
    
    // Update artwork status
    await pool.query(
      'UPDATE artworks SET status = ?, curator_feedback = ?, curator_id = ? WHERE id = ?',
      [status, feedback || null, curatorId, id]
    );
    
    // Handle tags if provided
    if (tags && Array.isArray(tags) && tags.length > 0) {
      // Remove existing tags for this artwork
      await pool.query('DELETE FROM artwork_tags WHERE artwork_id = ?', [id]);
      
      // Process each tag
      for (const tagName of tags) {
        // Check if tag exists
        const [existingTags] = await pool.query(
          'SELECT * FROM tags WHERE name = ?',
          [tagName.trim()]
        );
        
        let tagId;
        
        if (existingTags.length > 0) {
          // Use existing tag
          tagId = existingTags[0].id;
        } else {
          // Create new tag
          const [newTag] = await pool.query(
            'INSERT INTO tags (name) VALUES (?)',
            [tagName.trim()]
          );
          tagId = newTag.insertId;
        }
        
        // Associate tag with artwork
        await pool.query(
          'INSERT INTO artwork_tags (artwork_id, tag_id) VALUES (?, ?)',
          [id, tagId]
        );
      }
    }
    
    return res.status(200).json({
      success: true,
      message: `Artwork ${status} successfully`,
      data: {
        id: artwork.id,
        title: artwork.title,
        status,
        feedback: feedback || null
      }
    });
  } catch (error) {
    console.error('Review artwork error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to review artwork',
      error: error.message
    });
  }
};

// Get all available tags
export const getTags = async (req, res) => {
  try {
    const [tags] = await pool.query('SELECT * FROM tags ORDER BY name');
    
    return res.status(200).json({
      success: true,
      data: tags
    });
  } catch (error) {
    console.error('Get tags error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve tags',
      error: error.message
    });
  }
};

// Get review history for current curator
export const getReviewHistory = async (req, res) => {
  try {
    const curatorId = req.user.id;
    const { limit = 10, offset = 0 } = req.query;
    
    const query = `
      SELECT a.*, u.username as artist_name, 
      GROUP_CONCAT(DISTINCT t.name) as tags
      FROM artworks a
      JOIN users u ON a.artist_id = u.id
      LEFT JOIN artwork_tags at ON a.id = at.artwork_id
      LEFT JOIN tags t ON at.tag_id = t.id
      WHERE a.curator_id = ? AND a.status != 'pending'
      GROUP BY a.id
      ORDER BY a.updated_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const [artworks] = await pool.query(query, [curatorId, parseInt(limit), parseInt(offset)]);
    
    // Count total reviewed artworks for pagination
    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM artworks WHERE curator_id = ? AND status != "pending"',
      [curatorId]
    );
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
    console.error('Get review history error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve review history',
      error: error.message
    });
  }
};