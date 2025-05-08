import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, XCircle, Edit, Trash2, ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface Artwork {
  id: number;
  title: string;
  description: string;
  medium: string;
  dimensions: string;
  image_url: string;
  status: 'pending' | 'approved' | 'rejected';
  curator_feedback?: string;
  created_at: string;
}

const statusIcons = {
  pending: <Clock className="h-5 w-5 text-yellow-500" />,
  approved: <CheckCircle className="h-5 w-5 text-green-500" />,
  rejected: <XCircle className="h-5 w-5 text-red-500" />
};

const statusText = {
  pending: 'Pending Review',
  approved: 'Approved',
  rejected: 'Rejected'
};

const ArtistSubmissions = () => {
  const { user } = useAuth();
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [artworkToDelete, setArtworkToDelete] = useState<Artwork | null>(null);
  
  useEffect(() => {
    const fetchArtworks = async () => {
      setIsLoading(true);
      
      try {
        const response = await axios.get('/artworks', {
          params: { artist_id: user?.id }
        });
        
        setArtworks(response.data.data.artworks);
      } catch (error) {
        console.error('Error fetching artworks:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchArtworks();
  }, [user?.id]);
  
  const filteredArtworks = activeTab === 'all'
    ? artworks
    : artworks.filter(artwork => artwork.status === activeTab);
  
  const confirmDelete = (artwork: Artwork) => {
    setArtworkToDelete(artwork);
    setShowDeleteModal(true);
  };
  
  const cancelDelete = () => {
    setArtworkToDelete(null);
    setShowDeleteModal(false);
  };
  
  const deleteArtwork = async () => {
    if (!artworkToDelete) return;
    
    setIsDeleting(artworkToDelete.id);
    
    try {
      await axios.delete(`/artworks/${artworkToDelete.id}`);
      
      // Remove from state
      setArtworks(artworks.filter(a => a.id !== artworkToDelete.id));
      
      // Show success message
      window.showToast('Artwork deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting artwork:', error);
      window.showToast('Failed to delete artwork', 'error');
    } finally {
      setIsDeleting(null);
      setShowDeleteModal(false);
      setArtworkToDelete(null);
    }
  };
  
  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Submissions</h1>
            <p className="text-gray-600">Manage your artwork submissions and track their status</p>
          </div>
          <Link
            to="/artist/upload"
            className="mt-4 md:mt-0 px-6 py-2 bg-rose-500 text-white rounded-md hover:bg-rose-600 transition-colors inline-flex items-center"
          >
            Submit New Artwork
            <ChevronRight className="ml-1 h-5 w-5" />
          </Link>
        </div>
        
        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b border-gray-100">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 font-medium text-sm flex-1 md:flex-none md:px-8 ${
                  activeTab === tab
                    ? 'text-rose-500 border-b-2 border-rose-500'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab === 'all' ? 'All Submissions' : statusText[tab]}
                {tab !== 'all' && (
                  <span className="ml-2 inline-block">{statusIcons[tab]}</span>
                )}
              </button>
            ))}
          </div>
        </div>
        
        {/* Artworks List */}
        {isLoading ? (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="animate-pulse space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start space-x-4">
                  <div className="h-24 w-24 bg-gray-200 rounded" />
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded mb-2 w-1/3" />
                    <div className="h-4 bg-gray-200 rounded mb-3 w-1/2" />
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredArtworks.length > 0 ? (
          <div className="bg-white rounded-lg shadow">
            <ul className="divide-y divide-gray-100">
              {filteredArtworks.map((artwork) => (
                <motion.li
                  key={artwork.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="p-4 md:p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-start">
                    <div className="mb-4 md:mb-0 md:mr-6 flex-shrink-0">
                      <img
                        src={artwork.image_url}
                        alt={artwork.title}
                        className="h-24 w-24 md:h-28 md:w-28 object-cover rounded-md shadow-sm"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {artwork.title}
                      </h3>
                      
                      <div className="flex flex-wrap gap-x-4 gap-y-2 mb-3">
                        <div className="flex items-center text-sm text-gray-600">
                          Medium: <span className="ml-1 font-medium">{artwork.medium}</span>
                        </div>
                        
                        {artwork.dimensions && (
                          <div className="flex items-center text-sm text-gray-600">
                            Dimensions: <span className="ml-1 font-medium">{artwork.dimensions}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center text-sm">
                          <span className="mr-1">Status:</span>
                          <span className={`flex items-center font-medium ${
                            artwork.status === 'approved' ? 'text-green-600' :
                            artwork.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'
                          }`}>
                            {statusIcons[artwork.status]}
                            <span className="ml-1">{statusText[artwork.status]}</span>
                          </span>
                        </div>
                      </div>
                      
                      {artwork.description && (
                        <p className="text-gray-600 mb-3 line-clamp-2">
                          {artwork.description}
                        </p>
                      )}
                      
                      {artwork.curator_feedback && artwork.status !== 'pending' && (
                        <div className="mb-3 p-3 bg-gray-50 rounded-md">
                          <p className="text-sm font-medium text-gray-700 mb-1">Curator Feedback:</p>
                          <p className="text-sm text-gray-600">{artwork.curator_feedback}</p>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-3 mt-3">
                        <Link
                          to={`/artworks/${artwork.id}`}
                          className="px-4 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full transition-colors"
                        >
                          View Details
                        </Link>
                        
                        {artwork.status === 'pending' || artwork.status === 'rejected' ? (
                          <Link
                            to={`/artist/submissions/edit/${artwork.id}`}
                            className="px-4 py-1 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full transition-colors inline-flex items-center"
                          >
                            <Edit className="mr-1 h-3 w-3" />
                            Edit
                          </Link>
                        ) : null}
                        
                        <button
                          onClick={() => confirmDelete(artwork)}
                          disabled={isDeleting === artwork.id}
                          className="px-4 py-1 text-sm bg-red-50 hover:bg-red-100 text-red-700 rounded-full transition-colors inline-flex items-center"
                        >
                          <Trash2 className="mr-1 h-3 w-3" />
                          {isDeleting === artwork.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-10 text-center">
            <p className="text-gray-500 mb-4">No artworks found for the selected filter.</p>
            <Link
              to="/artist/upload"
              className="px-6 py-2 bg-rose-500 text-white rounded-md hover:bg-rose-600 transition-colors inline-block"
            >
              Submit New Artwork
            </Link>
          </div>
        )}
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && artworkToDelete && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <span className="font-medium">{artworkToDelete.title}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={deleteArtwork}
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

export default ArtistSubmissions;