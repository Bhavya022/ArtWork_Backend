import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Tag, ChevronLeft, ChevronRight } from 'lucide-react';

interface Artwork {
  id: number;
  title: string;
  description: string;
  medium: string;
  dimensions: string;
  image_url: string;
  artist_name: string;
  created_at: string;
}

const CuratorReview = () => {
  const [pendingArtworks, setPendingArtworks] = useState<Artwork[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [feedback, setFeedback] = useState('');
  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch pending artworks
  useEffect(() => {
    const fetchPendingArtworks = async () => {
      setIsLoading(true);
      
      try {
        const response = await axios.get('/curator/pending');
        setPendingArtworks(response.data.data.artworks);
      } catch (error) {
        console.error('Error fetching pending artworks:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    const fetchTags = async () => {
      try {
        const response = await axios.get('/curator/tags');
        setAvailableTags(response.data.data.map((tag: any) => tag.name));
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    };
    
    fetchPendingArtworks();
    fetchTags();
  }, []);
  
  const currentArtwork = pendingArtworks[currentIndex];
  
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      resetForm();
    }
  };
  
  const handleNext = () => {
    if (currentIndex < pendingArtworks.length - 1) {
      setCurrentIndex(currentIndex + 1);
      resetForm();
    }
  };
  
  const resetForm = () => {
    setSelectedTags([]);
    setFeedback('');
    setNewTag('');
  };
  
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };
  
  const addNewTag = () => {
    if (newTag.trim() && !availableTags.includes(newTag.trim()) && !selectedTags.includes(newTag.trim())) {
      setSelectedTags([...selectedTags, newTag.trim()]);
      setNewTag('');
    }
  };
  
  const handleReview = async (status: 'approved' | 'rejected') => {
    if (!currentArtwork) return;
    
    setIsSubmitting(true);
    
    try {
      await axios.post(`/curator/review/${currentArtwork.id}`, {
        status,
        feedback: feedback.trim() || null,
        tags: selectedTags.length > 0 ? selectedTags : null
      });
      
      // Remove the reviewed artwork from the list
      const updatedArtworks = [...pendingArtworks];
      updatedArtworks.splice(currentIndex, 1);
      
      setPendingArtworks(updatedArtworks);
      
      // Show success message
      window.showToast(`Artwork ${status} successfully`, 'success');
      
      // If we removed the last artwork in the list, go to the previous one
      if (currentIndex >= updatedArtworks.length) {
        setCurrentIndex(Math.max(0, updatedArtworks.length - 1));
      }
      
      resetForm();
    } catch (error) {
      console.error('Error reviewing artwork:', error);
      window.showToast('Failed to review artwork', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 mx-auto mb-4 rounded-full border-4 border-rose-500 border-t-transparent animate-spin" />
          <p className="text-gray-600">Loading artworks for review...</p>
        </div>
      </div>
    );
  }
  
  if (pendingArtworks.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-10 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              No artworks waiting for review
            </h1>
            <p className="text-gray-600 mb-6">
              Great job! You've reviewed all pending submissions. Check back later for new submissions.
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Review Submissions
              </h1>
              <p className="text-gray-600">
                {pendingArtworks.length} {pendingArtworks.length === 1 ? 'artwork' : 'artworks'} awaiting review
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className={`p-1 rounded-full ${
                  currentIndex === 0
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              
              <span className="text-gray-600">
                {currentIndex + 1} of {pendingArtworks.length}
              </span>
              
              <button
                onClick={handleNext}
                disabled={currentIndex === pendingArtworks.length - 1}
                className={`p-1 rounded-full ${
                  currentIndex === pendingArtworks.length - 1
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
          </div>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentArtwork?.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg shadow overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Artwork Preview */}
                <div className="bg-gray-100 p-4 flex items-center justify-center">
                  <img
                    src={currentArtwork.image_url}
                    alt={currentArtwork.title}
                    className="max-h-[500px] max-w-full object-contain"
                  />
                </div>
                
                {/* Review Form */}
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    {currentArtwork.title}
                  </h2>
                  
                  <p className="text-gray-600 mb-4">
                    by {currentArtwork.artist_name}
                  </p>
                  
                  <div className="mb-4">
                    <div className="grid grid-cols-2 gap-4">
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
                  </div>
                  
                  {currentArtwork.description && (
                    <div className="mb-6">
                      <p className="text-sm text-gray-500 mb-1">Description</p>
                      <p className="text-gray-700">{currentArtwork.description}</p>
                    </div>
                  )}
                  
                  {/* Tags */}
                  <div className="mb-6">
                    <div className="flex items-center mb-2">
                      <Tag className="h-4 w-4 text-gray-500 mr-2" />
                      <label className="text-sm font-medium text-gray-700">
                        Add Tags
                      </label>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {availableTags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={`px-3 py-1 rounded-full text-sm transition-colors ${
                            selectedTags.includes(tag)
                              ? 'bg-rose-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                    
                    <div className="flex">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add custom tag"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addNewTag();
                          }
                        }}
                      />
                      <button
                        onClick={addNewTag}
                        disabled={!newTag.trim()}
                        className="px-4 py-2 bg-gray-100 text-gray-800 rounded-r-md hover:bg-gray-200 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                  
                  {/* Feedback */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Feedback for Artist
                    </label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      placeholder="Optional feedback to the artist (required for rejections)"
                    />
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleReview('approved')}
                      disabled={isSubmitting}
                      className={`flex-1 py-2 rounded-md font-medium flex items-center justify-center space-x-2 transition-colors ${
                        isSubmitting
                          ? 'bg-green-100 text-green-400 cursor-not-allowed'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      <CheckCircle className="h-5 w-5" />
                      <span>Approve</span>
                    </button>
                    
                    <button
                      onClick={() => handleReview('rejected')}
                      disabled={isSubmitting || !feedback.trim()}
                      className={`flex-1 py-2 rounded-md font-medium flex items-center justify-center space-x-2 transition-colors ${
                        isSubmitting || !feedback.trim()
                          ? 'bg-red-100 text-red-400 cursor-not-allowed'
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      <XCircle className="h-5 w-5" />
                      <span>Reject</span>
                    </button>
                  </div>
                  
                  {!feedback.trim() && (
                    <p className="text-red-500 text-sm mt-2">
                      Feedback is required when rejecting an artwork
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CuratorReview;