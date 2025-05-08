import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, X, Heart, Eye, User, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Gallery {
  id: number;
  name: string;
  description: string;
  curator_name: string;
  curator_image: string;
  curator_bio: string;
  view_count: number;
  created_at: string;
  artworks: Artwork[];
}

interface Artwork {
  id: number;
  title: string;
  description: string;
  medium: string;
  dimensions: string;
  image_url: string;
  artist_name: string;
  like_count: number;
  view_count: number;
  tags: string[];
}

const GalleryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [gallery, setGallery] = useState<Gallery | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArtworkIndex, setSelectedArtworkIndex] = useState<number | null>(null);
  const { user, isCurator } = useAuth();
  
  const modalRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const fetchGallery = async () => {
      setIsLoading(true);
      
      try {
        const response = await axios.get(`/galleries/${id}`);
        setGallery(response.data.data);
      } catch (err: any) {
        console.error('Error fetching gallery:', err);
        setError(err.response?.data?.message || 'Failed to load gallery');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchGallery();
  }, [id]);
  
  const openArtworkModal = (index: number) => {
    setSelectedArtworkIndex(index);
    // Prevent background scrolling when modal is open
    document.body.style.overflow = 'hidden';
  };
  
  const closeArtworkModal = () => {
    setSelectedArtworkIndex(null);
    // Re-enable scrolling
    document.body.style.overflow = 'auto';
  };
  
  const handlePrevArtwork = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedArtworkIndex !== null && selectedArtworkIndex > 0) {
      setSelectedArtworkIndex(selectedArtworkIndex - 1);
    }
  };
  
  const handleNextArtwork = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedArtworkIndex !== null && gallery && selectedArtworkIndex < gallery.artworks.length - 1) {
      setSelectedArtworkIndex(selectedArtworkIndex + 1);
    }
  };
  
  const handleLikeArtwork = async (e: React.MouseEvent, artworkId: number) => {
    e.stopPropagation();
    
    try {
      await axios.post(`/artworks/${artworkId}/like`);
      
      // Update local state
      if (gallery) {
        const updatedArtworks = gallery.artworks.map(artwork => 
          artwork.id === artworkId 
            ? { ...artwork, like_count: artwork.like_count + 1 }
            : artwork
        );
        
        setGallery({ ...gallery, artworks: updatedArtworks });
      }
    } catch (error) {
      console.error('Error liking artwork:', error);
    }
  };
  
  // Close modal when clicking outside or pressing escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        closeArtworkModal();
      }
    };
    
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeArtworkModal();
      }
    };
    
    if (selectedArtworkIndex !== null) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [selectedArtworkIndex]);
  
  // Handle keyboard navigation for gallery
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedArtworkIndex === null) return;
      
      if (e.key === 'ArrowLeft') {
        if (selectedArtworkIndex > 0) {
          setSelectedArtworkIndex(selectedArtworkIndex - 1);
        }
      } else if (e.key === 'ArrowRight') {
        if (gallery && selectedArtworkIndex < gallery.artworks.length - 1) {
          setSelectedArtworkIndex(selectedArtworkIndex + 1);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedArtworkIndex, gallery]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 mx-auto mb-4 rounded-full border-4 border-rose-500 border-t-transparent animate-spin" />
          <p className="text-gray-600">Loading gallery...</p>
        </div>
      </div>
    );
  }
  
  if (error || !gallery) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-10 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Gallery not found
            </h1>
            <p className="text-gray-600 mb-6">
              {error ? error : "The gallery you're looking for doesn't exist or has been removed."}
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
  
  const currentArtwork = selectedArtworkIndex !== null ? gallery.artworks[selectedArtworkIndex] : null;
  
  return (
    <div className="min-h-screen pt-20 pb-12 bg-gray-50">
      {/* Gallery Header */}
      <div className="bg-white border-b border-gray-200 pb-6">
        <div className="container mx-auto px-4 pt-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-2">
              <Link
                to="/galleries"
                className="text-gray-500 hover:text-gray-700 mr-2"
              >
                Galleries
              </Link>
              <span className="text-gray-400">/</span>
              <h1 className="text-3xl font-bold text-gray-900 ml-2">
                {gallery.name}
              </h1>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-4 md:mb-0">
                <div className="flex items-center">
                  {gallery.curator_image ? (
                    <img
                      src={gallery.curator_image}
                      alt={gallery.curator_name}
                      className="h-10 w-10 rounded-full object-cover mr-3"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                      <User className="h-6 w-6 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <p className="text-gray-600">
                      Curated by <span className="font-medium">{gallery.curator_name}</span>
                    </p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>
                        {new Date(gallery.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-gray-600">
                  <Eye className="h-5 w-5 mr-1" />
                  <span>{gallery.view_count} Views</span>
                </div>
                
                {isCurator && user && gallery.curator_name === user.username && (
                  <Link
                    to={`/curator/galleries/${gallery.id}/edit`}
                    className="px-4 py-2 bg-rose-100 text-rose-700 rounded-md hover:bg-rose-200 transition-colors"
                  >
                    Edit Gallery
                  </Link>
                )}
              </div>
            </div>
            
            {gallery.description && (
              <div className="mt-6 prose max-w-none text-gray-700">
                <p>{gallery.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Gallery Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {gallery.artworks.length > 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, staggerChildren: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {gallery.artworks.map((artwork, index) => (
                <motion.div
                  key={artwork.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  whileHover={{ y: -5 }}
                  onClick={() => openArtworkModal(index)}
                  className="bg-white rounded-lg shadow overflow-hidden cursor-pointer group"
                >
                  <div className="relative overflow-hidden h-56">
                    <img
                      src={artwork.image_url}
                      alt={artwork.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                      <h3 className="text-white font-semibold">{artwork.title}</h3>
                      <p className="text-white/80 text-sm">by {artwork.artist_name}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-sm text-gray-500">
                        <Eye className="h-4 w-4 mr-1" />
                        <span>{artwork.view_count}</span>
                        <button
                          onClick={(e) => handleLikeArtwork(e, artwork.id)}
                          className="ml-4 flex items-center text-gray-500 hover:text-rose-500 transition-colors"
                        >
                          <Heart className="h-4 w-4 mr-1" />
                          <span>{artwork.like_count}</span>
                        </button>
                      </div>
                      <span className="text-gray-500 text-sm">{artwork.medium}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500 mb-2">This gallery has no artworks yet.</p>
              <Link
                to="/galleries"
                className="text-rose-500 hover:text-rose-600 font-medium"
              >
                Browse other galleries
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Curator Info */}
      <div className="container mx-auto px-4 pb-12">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">About the Curator</h2>
          <div className="flex flex-col md:flex-row md:items-start">
            {gallery.curator_image ? (
              <img
                src={gallery.curator_image}
                alt={gallery.curator_name}
                className="h-20 w-20 rounded-full object-cover mb-4 md:mb-0 md:mr-6"
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center mb-4 md:mb-0 md:mr-6">
                <User className="h-10 w-10 text-gray-500" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{gallery.curator_name}</h3>
              {gallery.curator_bio ? (
                <p className="text-gray-700">{gallery.curator_bio}</p>
              ) : (
                <p className="text-gray-500 italic">This curator hasn't added a bio yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Artwork Detail Modal */}
      <AnimatePresence>
        {selectedArtworkIndex !== null && currentArtwork && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
            onClick={closeArtworkModal}
          >
            <div
              ref={modalRef}
              className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col md:flex-row md:h-[80vh]">
                {/* Artwork Image */}
                <div className="md:w-3/5 bg-gray-100 flex items-center justify-center p-4 relative">
                  <img
                    src={currentArtwork.image_url}
                    alt={currentArtwork.title}
                    className="max-h-full max-w-full object-contain"
                  />
                  
                  {/* Navigation Buttons */}
                  {selectedArtworkIndex > 0 && (
                    <button
                      onClick={handlePrevArtwork}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-colors"
                    >
                      <ArrowLeft className="h-6 w-6" />
                    </button>
                  )}
                  
                  {gallery && selectedArtworkIndex < gallery.artworks.length - 1 && (
                    <button
                      onClick={handleNextArtwork}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-colors"
                    >
                      
                      <ArrowRight className="h-6 w-6" />
                    </button>
                  )}
                </div>
                
                {/* Artwork Info */}
                <div className="md:w-2/5 p-6 flex flex-col md:h-full overflow-y-auto">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">
                        {currentArtwork.title}
                      </h3>
                      <p className="text-gray-600">
                        by {currentArtwork.artist_name}
                      </p>
                    </div>
                    <button
                      onClick={closeArtworkModal}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                  
                  <div className="mb-6">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Medium</p>
                        <p className="font-medium">{currentArtwork.medium}</p>
                      </div>
                      
                      {currentArtwork.dimensions && (
                        <div>
                          <p className="text-sm text-gray-500">Dimensions</p>
                          <p className="font-medium">{currentArtwork.dimensions}</p>
                        </div>
                      )}
                    </div>
                    
                    {currentArtwork.description && (
                      <div className="mb-6">
                        <p className="text-sm text-gray-500 mb-1">Description</p>
                        <p className="text-gray-700">{currentArtwork.description}</p>
                      </div>
                    )}
                    
                    {currentArtwork.tags && currentArtwork.tags.length > 0 && (
                      <div className="mb-6">
                        <p className="text-sm text-gray-500 mb-2">Tags</p>
                        <div className="flex flex-wrap gap-2">
                          {currentArtwork.tags.map((tag, index) => (
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
                  </div>
                  
                  <div className="mt-auto flex justify-between items-center pt-4 border-t border-gray-100">
                    <div className="flex space-x-4">
                      <div className="flex items-center text-gray-600">
                        <Eye className="h-5 w-5 mr-1" />
                        <span>{currentArtwork.view_count} Views</span>
                      </div>
                      
                      <button
                        onClick={(e) => handleLikeArtwork(e, currentArtwork.id)}
                        className="flex items-center text-gray-600 hover:text-rose-500 transition-colors"
                      >
                        <Heart className="h-5 w-5 mr-1" />
                        <span>{currentArtwork.like_count} Likes</span>
                      </button>
                    </div>
                    
                    <Link
                      to={`/artworks/${currentArtwork.id}`}
                      className="text-rose-500 hover:text-rose-600 font-medium"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GalleryDetail;