import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Plus, Eye, CheckCircle, Clock, Edit, Trash2, ExternalLink } from 'lucide-react';

interface Gallery {
  id: number;
  name: string;
  description: string;
  is_published: boolean;
  view_count: number;
  artwork_count: number;
  created_at: string;
  updated_at: string;
}

const CuratorGalleries = () => {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [galleryToDelete, setGalleryToDelete] = useState<Gallery | null>(null);
  
  useEffect(() => {
    const fetchGalleries = async () => {
      setIsLoading(true);
      
      try {
        const response = await axios.get('/galleries/curator/own');
        setGalleries(response.data.data.galleries);
      } catch (error) {
        console.error('Error fetching galleries:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchGalleries();
  }, []);
  
  const confirmDelete = (gallery: Gallery) => {
    setGalleryToDelete(gallery);
    setShowDeleteModal(true);
  };
  
  const cancelDelete = () => {
    setGalleryToDelete(null);
    setShowDeleteModal(false);
  };
  
  const deleteGallery = async () => {
    if (!galleryToDelete) return;
    
    setIsDeleting(galleryToDelete.id);
    
    try {
      await axios.delete(`/galleries/${galleryToDelete.id}`);
      
      // Remove from state
      setGalleries(galleries.filter(g => g.id !== galleryToDelete.id));
      
      // Show success message
      window.showToast('Gallery deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting gallery:', error);
      window.showToast('Failed to delete gallery', 'error');
    } finally {
      setIsDeleting(null);
      setShowDeleteModal(false);
      setGalleryToDelete(null);
    }
  };
  
  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Galleries</h1>
            <p className="text-gray-600">Manage your curated virtual exhibitions</p>
          </div>
          <Link
            to="/curator/galleries/create"
            className="mt-4 md:mt-0 px-6 py-2 bg-rose-500 text-white rounded-md hover:bg-rose-600 transition-colors inline-flex items-center"
          >
            <Plus className="mr-2 h-5 w-5" />
            Create New Gallery
          </Link>
        </div>
        
        {isLoading ? (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="animate-pulse space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 border-b border-gray-100">
                  <div className="h-5 bg-gray-200 rounded mb-2 w-1/3" />
                  <div className="h-4 bg-gray-200 rounded mb-3 w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                </div>
              ))}
            </div>
          </div>
        ) : galleries.length > 0 ? (
          <div className="bg-white rounded-lg shadow">
            <ul className="divide-y divide-gray-100">
              {galleries.map((gallery) => (
                <motion.li
                  key={gallery.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                    <div className="mb-4 md:mb-0 flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-xl font-semibold text-gray-900 mr-3">
                          {gallery.name}
                        </h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          gallery.is_published
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {gallery.is_published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      
                      {gallery.description && (
                        <p className="text-gray-600 mb-3">
                          {gallery.description}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap gap-x-4 gap-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <Eye className="h-4 w-4 mr-1" />
                          {gallery.view_count} Views
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <span>{gallery.artwork_count} {gallery.artwork_count === 1 ? 'Artwork' : 'Artworks'}</span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>Last updated: {new Date(gallery.updated_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <Link
                        to={`/galleries/${gallery.id}`}
                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors inline-flex items-center"
                      >
                        <ExternalLink className="mr-1 h-3 w-3" />
                        View
                      </Link>
                      
                      <Link
                        to={`/curator/galleries/${gallery.id}/edit`}
                        className="px-3 py-1 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md transition-colors inline-flex items-center"
                      >
                        <Edit className="mr-1 h-3 w-3" />
                        Edit
                      </Link>
                      
                      <button
                        onClick={() => confirmDelete(gallery)}
                        disabled={isDeleting === gallery.id}
                        className="px-3 py-1 text-sm bg-red-50 hover:bg-red-100 text-red-700 rounded-md transition-colors inline-flex items-center"
                      >
                        <Trash2 className="mr-1 h-3 w-3" />
                        {isDeleting === gallery.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-10 text-center">
            <p className="text-gray-500 mb-4">You haven't created any galleries yet.</p>
            <Link
              to="/curator/galleries/create"
              className="px-6 py-2 bg-rose-500 text-white rounded-md hover:bg-rose-600 transition-colors inline-block"
            >
              Create Your First Gallery
            </Link>
          </div>
        )}
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && galleryToDelete && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <span className="font-medium">{galleryToDelete.name}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={deleteGallery}
                disabled={isDeleting !== null}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                {isDeleting !== null ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CuratorGalleries;