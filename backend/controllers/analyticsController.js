import pool from '../config/database.js';

// Get analytics for a curator's galleries
export const getCuratorAnalytics = async (req, res) => {
  try {
    const curatorId = req.user.id;
    
    // Get total views for all curator's galleries
    const [totalViews] = await pool.query(`
      SELECT SUM(view_count) as total_views
      FROM galleries
      WHERE curator_id = ?
    `, [curatorId]);
    
    // Get total artworks in curator's galleries
    const [totalArtworks] = await pool.query(`
      SELECT COUNT(DISTINCT ga.artwork_id) as total_artworks
      FROM gallery_artworks ga
      JOIN galleries g ON ga.gallery_id = g.id
      WHERE g.curator_id = ?
    `, [curatorId]);
    
    // Get views per gallery
    const [galleryViews] = await pool.query(`
      SELECT g.id, g.name, g.view_count, COUNT(DISTINCT ga.artwork_id) as artwork_count
      FROM galleries g
      LEFT JOIN gallery_artworks ga ON g.id = ga.gallery_id
      WHERE g.curator_id = ?
      GROUP BY g.id
      ORDER BY g.view_count DESC
      LIMIT 10
    `, [curatorId]);
    
    // Get top artworks by views
    const [topArtworks] = await pool.query(`
      SELECT a.id, a.title, a.image_url, a.view_count, a.like_count, u.username as artist_name
      FROM artworks a
      JOIN users u ON a.artist_id = u.id
      JOIN gallery_artworks ga ON a.id = ga.artwork_id
      JOIN galleries g ON ga.gallery_id = g.id
      WHERE g.curator_id = ?
      GROUP BY a.id
      ORDER BY a.view_count DESC
      LIMIT 10
    `, [curatorId]);
    
    return res.status(200).json({
      success: true,
      data: {
        total_views: totalViews[0].total_views || 0,
        total_artworks: totalArtworks[0].total_artworks || 0,
        gallery_views: galleryViews,
        top_artworks: topArtworks
      }
    });
  } catch (error) {
    console.error('Get curator analytics error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve analytics',
      error: error.message
    });
  }
};

// Get analytics for an artist
export const getArtistAnalytics = async (req, res) => {
  try {
    const artistId = req.user.id;
    
    // Get total views for all artist's artworks
    const [totalViews] = await pool.query(`
      SELECT SUM(view_count) as total_views, SUM(like_count) as total_likes
      FROM artworks
      WHERE artist_id = ?
    `, [artistId]);
    
    // Get total artworks by status
    const [artworkStatus] = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM artworks
      WHERE artist_id = ?
      GROUP BY status
    `, [artistId]);
    
    // Format status counts
    const statusCounts = {
      pending: 0,
      approved: 0,
      rejected: 0
    };
    
    artworkStatus.forEach(item => {
      statusCounts[item.status] = item.count;
    });
    
    // Get top artworks by views
    const [topArtworks] = await pool.query(`
      SELECT id, title, image_url, view_count, like_count, status
      FROM artworks
      WHERE artist_id = ?
      ORDER BY view_count DESC
      LIMIT 10
    `, [artistId]);
    
    // Get galleries featuring this artist's work
    const [featuredIn] = await pool.query(`
      SELECT g.id, g.name, g.view_count, u.username as curator_name, 
      COUNT(DISTINCT ga.artwork_id) as artwork_count
      FROM galleries g
      JOIN users u ON g.curator_id = u.id
      JOIN gallery_artworks ga ON g.id = ga.gallery_id
      JOIN artworks a ON ga.artwork_id = a.id
      WHERE a.artist_id = ? AND g.is_published = 1
      GROUP BY g.id
      ORDER BY g.view_count DESC
    `, [artistId]);
    
    return res.status(200).json({
      success: true,
      data: {
        total_views: totalViews[0].total_views || 0,
        total_likes: totalViews[0].total_likes || 0,
        artwork_counts: statusCounts,
        top_artworks: topArtworks,
        featured_in: featuredIn
      }
    });
  } catch (error) {
    console.error('Get artist analytics error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve analytics',
      error: error.message
    });
  }
};

// Get public site statistics
export const getSiteStats = async (req, res) => {
  try {
    // Get total artworks, artists, and galleries
    const [totals] = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM artworks WHERE status = 'approved') as total_artworks,
        (SELECT COUNT(*) FROM users WHERE role = 'artist') as total_artists,
        (SELECT COUNT(*) FROM galleries WHERE is_published = 1) as total_galleries
    `);
    
    // Get most viewed galleries
    const [topGalleries] = await pool.query(`
      SELECT g.id, g.name, g.view_count, u.username as curator_name
      FROM galleries g
      JOIN users u ON g.curator_id = u.id
      WHERE g.is_published = 1
      ORDER BY g.view_count DESC
      LIMIT 5
    `);
    
    // Get most liked artworks
    const [topArtworks] = await pool.query(`
      SELECT a.id, a.title, a.image_url, a.view_count, a.like_count, u.username as artist_name
      FROM artworks a
      JOIN users u ON a.artist_id = u.id
      WHERE a.status = 'approved'
      ORDER BY a.like_count DESC
      LIMIT 5
    `);
    
    return res.status(200).json({
      success: true,
      data: {
        totals: totals[0],
        top_galleries: topGalleries,
        top_artworks: topArtworks
      }
    });
  } catch (error) {
    console.error('Get site stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve site statistics',
      error: error.message
    });
  }
};