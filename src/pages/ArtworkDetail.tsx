import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Heart, Eye, Calendar, ArrowLeft, Share2, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Artwork {
  id: number;
  title: string;
  description: string;
  medium: string;
  dimensions: string;
  image_url: string;
  artist_name: string;
  artist_id: number;
  artist_image: string;
  artist_bio: string;
  like_count: number;
  view_count: number;
  tags: string[];
  created_at: string;
}

const ArtworkDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchArtwork = async () => {
      setIsLoading(true);
      
      try {
        const response = await axios.get(`/artworks/${id}`);
        setArtwork(response.data.data);
      } catch (err: any) {
        console.error('Error fetching artwork:', err);
        setError(err.response?.data?.message || 'Failed to load artwork');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchArtwork();
  }, [id]);
  
  const handleLike = async () => {
    if (!artwork) return;
    
    try {
      await axios.post(`/artworks/${artwork.id}/like`);
      
      // Update local state
      setArtwork({ ...artwork, like_count: artwork.like_count + 1 });
    } catch (error) {
      console.error('Error liking artwork:', error);
    }
  };
  
  const handleShare = () => {
    setShowShareOptions(!showShareOptions);
  };
  
  const shareToSocial = (platform: string) => {
    if (!artwork) return;
    
    const url = window.location.href;
    const text = `Check out "${artwork.title}" by ${artwork.artist_name} on ArtShow`;
    
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'pinterest':
        shareUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(artwork.image_url)}&description=${encodeURIComponent(text)}`;
        break;
      default:
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
    
    setShowShareOptions(false);
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => {
        window.showToast('Link copied to clipboard!', 'success');
        setShowShareOptions(false);
      })
      .catch((err) => {
        console.error('Failed to copy link:', err);
        window.showToast('Failed to copy link', 'error');
      });
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 mx-auto mb-4 rounded-full border-4 border-rose-500 border-t-transparent animate-spin" />
          <p className="text-gray-600">Loading artwork...</p>
        </div>
      </div>
    );
  }
  
  if (error || !artwork) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-10 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Artwork not found
            </h1>
            <p className="text-gray-600 mb-6">
              {error ? error : "The artwork you're looking for doesn't exist or has been removed."}
            </p>
            <Link
              to="/galleries"
              className="px-6 py-2 bg-rose-500 text-white rounded-md hover:bg-rose-600 transition-colors inline-block"
            >
              Browse Galleries
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen pt-20 pb-12 bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Navigation */}
          <div className="mb-6">
            <Link
              to="/galleries"
              className="inline-flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Galleries
            </Link>
          </div>
          
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Artwork Image */}
              <div className="bg-gray-100 p-6 flex items-center justify-center">
                <motion.img
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  src={artwork.image_url}
                  alt={artwork.title}
                  className="max-h-[500px] max-w-full object-contain shadow-lg"
                />
              </div>
              
              {/* Artwork Details */}
              <div className="p-6 md:p-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {artwork.title}
                  </h1>
                  
                  <div className="flex items-center mb-6">
                    {artwork.artist_image ? (
                      <img
                        src={artwork.artist_image}
                        alt={artwork.artist_name}
                        className="h-8 w-8 rounded-full object-cover mr-3"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                        <User className="h-4 w-4 text-gray-500" />
                      </div>
                    )}
                    <span className="text-gray-700">by <span className="font-medium">{artwork.artist_name}</span></span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Medium</p>
                      <p className="font-medium">{artwork.medium}</p>
                    </div>
                    
                    {artwork.dimensions && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Dimensions</p>
                        <p className="font-medium">{artwork.dimensions}</p>
                      </div>
                    )}
                  </div>
                  
                  {artwork.description && (
                    <div className="mb-6">
                      <p className="text-sm text-gray-500 mb-2">Description</p>
                      <p className="text-gray-700">{artwork.description}</p>
                    </div>
                  )}
                  
                  {artwork.tags && artwork.tags.length > 0 && (
                    <div className="mb-6">
                      <p className="text-sm text-gray-500 mb-2">Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {artwork.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-6 mb-6">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-5 w-5 mr-2" />
                      <span>
                        {new Date(artwork.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <Eye className="h-5 w-5 mr-2" />
                      <span>{artwork.view_count} Views</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-4 mt-8">
                    <button
                      onClick={handleLike}
                      className="flex-1 py-3 flex items-center justify-center rounded-md bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
                    >
                      <Heart className="mr-2 h-5 w-5" />
                      <span>Like ({artwork.like_count})</span>
                    </button>
                    
                    <div className="relative">
                      <button
                        onClick={handleShare}
                        className="flex-1 py-3 px-6 flex items-center justify-center rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                      >
                        <Share2 className="mr-2 h-5 w-5" />
                        <span>Share</span>
                      </button>
                      
                      {showShareOptions && (
                        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                          <div className="py-1">
                            <button
                              onClick={() => shareToSocial('twitter')}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              Share on Twitter
                            </button>
                            <button
                              onClick={() => shareToSocial('facebook')}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              Share on Facebook
                            </button>
                            <button
                              onClick={() => shareToSocial('pinterest')}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              Share on Pinterest
                            </button>
                            <button
                              onClick={copyToClipboard}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              Copy Link
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
          
          {/* Artist Info */}
          <div className="mt-10 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">About the Artist</h2>
            <div className="flex flex-col md:flex-row md:items-start">
              {artwork.artist_image ? (
                <img
                  src={artwork.artist_image}
                  alt={artwork.artist_name}
                  className="h-20 w-20 rounded-full object-cover mb-4 md:mb-0 md:mr-6"
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center mb-4 md:mb-0 md:mr-6">
                  <User className="h-10 w-10 text-gray-500" />
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{artwork.artist_name}</h3>
                {artwork.artist_bio ? (
                  <p className="text-gray-700">{artwork.artist_bio}</p>
                ) : (
                  <p className="text-gray-500 italic">This artist hasn't added a bio yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtworkDetail;