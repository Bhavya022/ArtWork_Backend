import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  Palette, 
  Eye, 
  BarChart2, 
  Heart, 
  Upload, 
  Clock, 
  CheckCircle, 
  XCircle,
  ChevronRight,
  LayoutGrid,
  PlusCircle,
  Bookmark
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ArtworkCard from '../components/ArtworkCard';
import GalleryCard from '../components/GalleryCard';

interface ArtistStats {
  total_views: number;
  total_likes: number;
  artwork_counts: {
    pending: number;
    approved: number;
    rejected: number;
  };
  top_artworks: any[];
  featured_in: any[];
}

interface CuratorStats {
  total_views: number;
  total_artworks: number;
  gallery_views: any[];
  top_artworks: any[];
}
axios.defaults.baseURL = 'http://localhost:3001/api';
const Dashboard = () => {
  const { user, isArtist, isCurator } = useAuth();
  const [artistStats, setArtistStats] = useState<ArtistStats | null>(null);
  const [curatorStats, setCuratorStats] = useState<CuratorStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        if (isArtist) { 
          const response = await axios.get('/analytics/artist'); 
          console.log("artist analytics",response)
          setArtistStats(response.data.data);
        } else if (isCurator) {
          const response = await axios.get('/analytics/curator'); 
          console.log("Curator",response)
          setCuratorStats(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [isArtist, isCurator]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
        <div className="text-center">
          <Palette className="h-16 w-16 text-rose-500 animate-pulse mx-auto mb-4" />
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-gray-600 mt-2">
            {isArtist 
              ? 'Manage your artwork submissions and track your progress'
              : 'Review submissions and curate virtual galleries'
            }
          </p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {isArtist && artistStats && (
            <>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white p-6 rounded-lg shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-500 mb-1">Total Artwork Views</p>
                    <h3 className="text-3xl font-bold text-gray-900">{artistStats.total_views}</h3>
                  </div>
                  <Eye className="h-8 w-8 text-indigo-500" />
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="bg-white p-6 rounded-lg shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-500 mb-1">Total Likes</p>
                    <h3 className="text-3xl font-bold text-gray-900">{artistStats.total_likes}</h3>
                  </div>
                  <Heart className="h-8 w-8 text-rose-500" />
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="bg-white p-6 rounded-lg shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-500 mb-1">Submission Status</p>
                    <div className="flex space-x-4 mt-2">
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 text-yellow-500 mr-1" />
                        <span className="text-sm">{artistStats.artwork_counts.pending} Pending</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-1" />
                        <span className="text-sm">{artistStats.artwork_counts.approved} Approved</span>
                      </div>
                      <div className="flex items-center">
                        <XCircle className="h-5 w-5 text-red-500 mr-1" />
                        <span className="text-sm">{artistStats.artwork_counts.rejected} Rejected</span>
                      </div>
                    </div>
                  </div>
                  <BarChart2 className="h-8 w-8 text-blue-500" />
                </div>
              </motion.div>
            </>
          )}
          
          {isCurator && curatorStats && (
            <>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white p-6 rounded-lg shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-500 mb-1">Total Gallery Views</p>
                    <h3 className="text-3xl font-bold text-gray-900">{curatorStats.total_views}</h3>
                  </div>
                  <Eye className="h-8 w-8 text-indigo-500" />
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="bg-white p-6 rounded-lg shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-500 mb-1">Featured Artworks</p>
                    <h3 className="text-3xl font-bold text-gray-900">{curatorStats.total_artworks}</h3>
                  </div>
                  <Palette className="h-8 w-8 text-rose-500" />
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="bg-white p-6 rounded-lg shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-500 mb-1">Review Queue</p>
                    <Link
                      to="/curator/review"
                      className="mt-2 inline-flex items-center text-rose-500 hover:text-rose-600"
                    >
                      Go to review queue
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                  <Clock className="h-8 w-8 text-amber-500" />
                </div>
              </motion.div>
            </>
          )}
        </div>
        
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {isArtist && (
              <>
                <Link
                  to="/artist/upload"
                  className="flex items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Upload className="h-6 w-6 text-indigo-500 mr-3" />
                  <span className="font-medium">Upload Artwork</span>
                </Link>
                
                <Link
                  to="/artist/submissions"
                  className="flex items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <LayoutGrid className="h-6 w-6 text-amber-500 mr-3" />
                  <span className="font-medium">My Submissions</span>
                </Link>
              </>
            )}
            
            {isCurator && (
              <>
                <Link
                  to="/curator/review"
                  className="flex items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
                  <span className="font-medium">Review Artworks</span>
                </Link>
                
                <Link
                  to="/curator/galleries"
                  className="flex items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <LayoutGrid className="h-6 w-6 text-rose-500 mr-3" />
                  <span className="font-medium">My Galleries</span>
                </Link>
                
                <Link
                  to="/curator/galleries/create"
                  className="flex items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <PlusCircle className="h-6 w-6 text-blue-500 mr-3" />
                  <span className="font-medium">Create Gallery</span>
                </Link>
              </>
            )}
            
            <Link
              to="/galleries"
              className="flex items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bookmark className="h-6 w-6 text-purple-500 mr-3" />
              <span className="font-medium">Browse Galleries</span>
            </Link>
          </div>
        </div>
        
        {/* Artist-specific sections */}
        {isArtist && artistStats && (
          <>
            {/* Featured In */}
            {artistStats.featured_in && artistStats.featured_in.length > 0 && (
              <div className="mb-10">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Featured In Galleries</h2>
                  <Link
                    to="/artist/submissions"
                    className="text-rose-500 hover:text-rose-600 font-medium flex items-center"
                  >
                    View All <ChevronRight className="h-5 w-5 ml-1" />
                  </Link>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {artistStats.featured_in.slice(0, 3).map((gallery) => (
                    <GalleryCard key={gallery.id} gallery={gallery} />
                  ))}
                </div>
              </div>
            )}
            
            {/* Top Artworks */}
            {artistStats.top_artworks && artistStats.top_artworks.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Your Top Artworks</h2>
                  <Link
                    to="/artist/submissions"
                    className="text-rose-500 hover:text-rose-600 font-medium flex items-center"
                  >
                    View All <ChevronRight className="h-5 w-5 ml-1" />
                  </Link>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {artistStats.top_artworks.slice(0, 4).map((artwork) => (
                    <ArtworkCard
                      key={artwork.id}
                      artwork={{
                        ...artwork,
                        artist_name: user?.username || ''
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
        
        {/* Curator-specific sections */}
        {isCurator && curatorStats && (
          <>
            {/* Popular Galleries */}
            {curatorStats.gallery_views && curatorStats.gallery_views.length > 0 && (
              <div className="mb-10">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Your Popular Galleries</h2>
                  <Link
                    to="/curator/galleries"
                    className="text-rose-500 hover:text-rose-600 font-medium flex items-center"
                  >
                    View All <ChevronRight className="h-5 w-5 ml-1" />
                  </Link>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {curatorStats.gallery_views.slice(0, 3).map((gallery) => (
                    <GalleryCard key={gallery.id} gallery={gallery} />
                  ))}
                </div>
              </div>
            )}
            
            {/* Featured Artworks */}
            {curatorStats.top_artworks && curatorStats.top_artworks.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Popular Artworks You've Featured</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {curatorStats.top_artworks.slice(0, 4).map((artwork) => (
                    <ArtworkCard key={artwork.id} artwork={artwork} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;