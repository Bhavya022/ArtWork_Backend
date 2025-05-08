import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Save, 
  Eye, 
  Plus, 
  X, 
  ExternalLink, 
  ArrowLeft, 
  ArrowRight,
  Search,
  Check
} from 'lucide-react';

interface Gallery {
  id: number;
  name: string;
  description: string;
  is_published: boolean;
  view_count: number;
  artworks?: Artwork[];
}

interface Artwork {
  id: number;
  title: string;
  image_url: string;
  artist_name: string;
  medium: string;
  display_order: number;
}

const CuratorEditGallery = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [gallery, setGallery] = useState<Gallery | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_published: false
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [showAddArtworkModal, setShowAddArtworkModal] = useState(false);
  const [availableArtworks, setAvailableArtworks] = useState<Artwork[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isAddingArtwork, setIsAddingArtwork] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItemId, setDraggedItemId] = useState<number | null>(null);
  
  // Fetch gallery data
  useEffect(() => {
    const fetchGallery = async () => {
      setIsLoading(true);
      
      try {
        const response = await axios.get(`/galleries/${id}`);
        const galleryData = response.data.data;
        
        setGallery(galleryData);
        setFormData({
          name: galleryData.name,
          description: galleryData.description || '',
          is_published: galleryData.is_published
        });
      } catch (error) {
        console.error('Error fetching gallery:', error);
        navigate('/curator/galleries');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchGallery();
  }, [id, navigate]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear specific error when field is changed
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };
  
  const handleTogglePublish = () => {
    setFormData({ ...formData, is_published: !formData.is_published });
  };
  
  const validate = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Gallery name is required';
    }
    
    // Validate gallery has artworks when publishing
    if (formData.is_published && (!gallery?.artworks || gallery.artworks.length === 0)) {
      newErrors.general = 'Cannot publish empty gallery. Add artworks first.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    setIsSaving(true);
    
    try {
      await axios.put(`/galleries/${id}`, {
        name: formData.name,
        description: formData.description || null,
        is_published: formData.is_published
      });
      
      // Show success message
      window.showToast('Gallery updated successfully!', 'success');
      
      // Refresh gallery data
      const response = await axios.get(`/galleries/${id}`);
      const galleryData = response.data.data;
      
      setGallery(galleryData);
    } catch (err: any) {
      console.error('Gallery update error:', err);
      setErrors({
        general: err.response?.data?.message || 'Failed to update gallery. Please try again.'
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleRemoveArtwork = async (artworkId: number) => {
    try {
      await axios.delete(`/galleries/${id}/artworks/${artworkId}`);
      
      // Update local state
      if (gallery && gallery.artworks) {
        setGallery({
          ...gallery,
          artworks: gallery.artworks.filter(a => a.id !== artworkId)
        });
      }
      
      window.showToast('Artwork removed successfully', 'success');
    } catch (error) {
      console.error('Error removing artwork:', error);
      window.showToast('Failed to remove artwork', 'error');
    }
  };
  
  const openAddArtworkModal = async () => {
    setShowAddArtworkModal(true);
    searchArtworks();
  };
  
  const searchArtworks = async () => {
    setIsSearching(true);
    
    try {
      const params: any = {
        status: 'approved',
      };
      
      if (searchQuery) {
        params.search = searchQuery;
      }
      
      const response = await axios.get('/artworks', { params });
      
      // Filter out artworks already in the gallery
      const existingArtworkIds = gallery?.artworks?.map(a => a.id) || [];
      const filtered = response.data.data.artworks.filter(
        (a: any) => !existingArtworkIds.includes(a.id)
      );
      
      setAvailableArtworks(filtered);
    } catch (error) {
      console.error('Error searching artworks:', error);
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleAddArtwork = async (artwork: Artwork) => {
    setIsAddingArtwork(true);
    
    try {
      await axios.post(`/galleries/${id}/artworks`, {
        artwork_id: artwork.id
      });
      
      // Refresh gallery data
      const response = await axios.get(`/galleries/${id}`);
      const galleryData = response.data.data;
      
      setGallery(galleryData);
      
      // Remove the added artwork from available artworks
      setAvailableArtworks(availableArtworks.filter(a => a.id !== artwork.id));
      
      window.showToast('Artwork added successfully', 'success');
    } catch (error) {
      console.error('Error adding artwork:', error);
      window.showToast('Failed to add artwork', 'error');
    } finally {
      setIsAddingArtwork(false);
    }
  };
  
  const handleDragStart = (artworkId: number) => {
    setIsDragging(true);
    setDraggedItemId(artworkId);
  };
  
  const handleDragOver = (e: React.DragEvent, artworkId: number) => {
    e.preventDefault();
    
    if (!isDragging || draggedItemId === artworkId || !gallery?.artworks) return;
    
    // Reorder artworks in state
    const draggedIndex = gallery.artworks.findIndex(a => a.id === draggedItemId);
    const hoverIndex = gallery.artworks.findIndex(a => a.id === artworkId);
    
    if (draggedIndex < 0 || hoverIndex < 0) return;
    
    const newArtworks = [...gallery.artworks];
    const draggedItem = newArtworks[draggedIndex];
    
    // Remove dragged item
    newArtworks.splice(draggedIndex, 1);
    // Insert at new position
    newArtworks.splice(hoverIndex, 0, draggedItem);
    
    // Update display order
    const updatedArtworks = newArtworks.map((artwork, index) => ({
      ...artwork,
      display_order: index + 1
    }));
    
    setGallery({
      ...gallery,
      artworks: updatedArtworks
    });
  };
  
  const handleDragEnd = async () => {
    setIsDragging(false);
    setDraggedItemId(null);
    
    if (!gallery?.artworks) return;
    
    // Save new artwork order to server
    try {
      const artwork_orders = gallery.artworks.map((artwork, index) => ({
        artwork_id: artwork.id,
        display_order: index + 1
      }));
      
      await axios.put(`/galleries/${id}/order`, { artwork_orders });
    } catch (error) {
      console.error('Error updating artwork order:', error);
      window.showToast('Failed to save artwork order', 'error');
    }
  };
  
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
  
  if (!gallery) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-10 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Gallery not found
            </h1>
            <p className="text-gray-600 mb-6">
              The gallery you're looking for doesn't exist or you don't have permission to edit it.
            </p>
            <Link
              to="/curator/galleries"
              className="px-6 py-2 bg-rose-500 text-white rounded-md hover:bg-rose-600 transition-colors inline-block"
            >
              Back to Galleries
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Edit Gallery: {gallery.name}
              </h1>
              <div className="flex items-center">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  formData.is_published
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {formData.is_published ? 'Published' : 'Draft'}
                </span>
                <span className="mx-2 text-gray-400">•</span>
                <span className="text-gray-600 text-sm">
                  {gallery.view_count} Views
                </span>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0 flex space-x-3">
              <Link
                to={`/galleries/${id}`}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors inline-flex items-center"
              >
                <Eye className="mr-2 h-5 w-5" />
                Preview
              </Link>
              
              <Link
                to="/curator/galleries"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Back to Galleries
              </Link>
            </div>
          </div>
          
          {/* Gallery Settings */}
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">Gallery Settings</h2>
            </div>
            
            {errors.general && (
              <div className="mx-6 mt-6 p-4 bg-red-50 text-red-700 rounded-md">
                {errors.general}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Gallery Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter gallery name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="Describe your gallery (theme, concept, etc.)"
                  />
                </div>
                
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={handleTogglePublish}
                    className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 ${
                      formData.is_published ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  >
                    <span className="sr-only">Toggle published</span>
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                        formData.is_published ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    {formData.is_published ? 'Published' : 'Draft'} 
                  </span>
                </div>
                
                <div className="flex justify-end pt-6 border-t border-gray-100">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className={`px-6 py-2 bg-rose-500 text-white rounded-md font-medium inline-flex items-center ${
                      isSaving ? 'opacity-70 cursor-not-allowed' : 'hover:bg-rose-600'
                    }`}
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                    {!isSaving && <Save className="ml-2 h-5 w-5" />}
                  </button>
                </div>
              </div>
            </form>
          </div>
          
          {/* Gallery Artworks */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Gallery Artworks</h2>
              <button
                onClick={openAddArtworkModal}
                className="px-4 py-2 bg-rose-500 text-white rounded-md hover:bg-rose-600 transition-colors inline-flex items-center"
              >
                <Plus className="mr-2 h-5 w-5" />
                Add Artwork
              </button>
            </div>
            
            <div className="p-6">
              {gallery.artworks && gallery.artworks.length > 0 ? (
                <div>
                  <p className="text-gray-600 mb-4">
                    Drag and drop artworks to change their display order.
                  </p>
                  
                  <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {gallery.artworks.map((artwork, index) => (
                      <li
                        key={artwork.id}
                        draggable
                        onDragStart={() => handleDragStart(artwork.id)}
                        onDragOver={(e) => handleDragOver(e, artwork.id)}
                        onDragEnd={handleDragEnd}
                        className={`border border-gray-200 rounded-lg overflow-hidden cursor-move ${
                          isDragging && draggedItemId === artwork.id 
                            ? 'opacity-50 border-rose-300' 
                            : ''
                        }`}
                      >
                        <div className="relative">
                          <img
                            src={artwork.image_url}
                            alt={artwork.title}
                            className="w-full h-48 object-cover"
                          />
                          <div className="absolute top-2 right-2">
                            <button
                              onClick={() => handleRemoveArtwork(artwork.id)}
                              className="p-1 bg-gray-800 bg-opacity-70 rounded-full text-white hover:bg-opacity-100"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="absolute top-2 left-2">
                            <span className="flex items-center justify-center h-6 w-6 bg-gray-800 bg-opacity-70 rounded-full text-white text-sm">
                              {index + 1}
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-medium text-gray-900 truncate">
                            {artwork.title}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            by {artwork.artist_name}
                          </p>
                          <p className="text-gray-500 text-sm mt-1">
                            {artwork.medium}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500 mb-4">No artworks in this gallery yet.</p>
                  <button
                    onClick={openAddArtworkModal}
                    className="px-6 py-2 bg-rose-500 text-white rounded-md hover:bg-rose-600 transition-colors inline-flex items-center"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Add Your First Artwork
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Add Artwork Modal */}
      <AnimatePresence>
        {showAddArtworkModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900">Add Artwork to Gallery</h3>
                <button
                  onClick={() => setShowAddArtworkModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="p-6 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        searchArtworks();
                      }
                    }}
                    placeholder="Search by title, artist or medium..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                {isSearching ? (
                  <div className="text-center py-10">
                    <div className="h-10 w-10 mx-auto mb-4 rounded-full border-4 border-rose-500 border-t-transparent animate-spin" />
                    <p className="text-gray-600">Searching artworks...</p>
                  </div>
                ) : availableArtworks.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {availableArtworks.map((artwork) => (
                      <div key={artwork.id} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="relative">
                          <img
                            src={artwork.image_url}
                            alt={artwork.title}
                            className="w-full h-48 object-cover"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="font-medium text-gray-900 truncate mb-1">
                            {artwork.title}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            by {artwork.artist_name}
                          </p>
                          <p className="text-gray-500 text-sm mt-1 mb-3">
                            {artwork.medium}
                          </p>
                          <button
                            onClick={() => handleAddArtwork(artwork)}
                            disabled={isAddingArtwork}
                            className={`w-full py-2 text-center rounded-md transition-colors ${
                              isAddingArtwork
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                            }`}
                          >
                            <span className="flex items-center justify-center">
                              <Plus className="h-4 w-4 mr-1" />
                              Add to Gallery
                            </span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-gray-500 mb-2">No available artworks found.</p>
                    <p className="text-gray-400 text-sm">
                      Try different search terms or wait for more approved submissions.
                    </p>
                  </div>
                )}
              </div>
              
              <div className="p-6 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => setShowAddArtworkModal(false)}
                  className="px-6 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CuratorEditGallery;