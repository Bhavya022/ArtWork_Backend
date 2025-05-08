import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Search, Filter, X } from 'lucide-react';
import GalleryCard from '../components/GalleryCard';

interface Gallery {
  id: number;
  name: string;
  curator_name: string;
  artwork_count: number;
  view_count: number;
  tags?: string;
}

const Galleries = () => {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<{
    tag: string;
    curator_id: string;
  }>({
    tag: '',
    curator_id: '',
  });
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 12,
    offset: 0,
    hasMore: false,
  });
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  
  // Fetch galleries
  const fetchGalleries = async (newOffset = 0) => {
    setIsLoading(true);
    
    try {
      const params = {
        limit: pagination.limit,
        offset: newOffset,
        search: search || undefined,
        tag: filters.tag || undefined,
        curator_id: filters.curator_id || undefined,
      };
      
      const response = await axios.get('/galleries', { params });
      
      if (newOffset === 0) {
        setGalleries(response.data.data.galleries);
      } else {
        setGalleries((prev) => [...prev, ...response.data.data.galleries]);
      }
      
      setPagination(response.data.data.pagination);
    } catch (error) {
      console.error('Error fetching galleries:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch tags for filtering
  const fetchTags = async () => {
    try {
      const response = await axios.get('/curator/tags');
      setAvailableTags(response.data.data.map((tag: any) => tag.name));
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };
  
  // Initial fetch
  useEffect(() => {
    fetchGalleries();
    fetchTags();
  }, []);
  
  // Fetch when filters or search change
  useEffect(() => {
    fetchGalleries(0);
  }, [search, filters]);
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchGalleries(0);
  };
  
  // Handle load more
  const handleLoadMore = () => {
    if (pagination.hasMore) {
      fetchGalleries(pagination.offset + pagination.limit);
    }
  };
  
  // Clear all filters
  const clearFilters = () => {
    setFilters({ tag: '', curator_id: '' });
    setSearch('');
  };
  
  // Check if any filters are active
  const hasActiveFilters = !!search || !!filters.tag || !!filters.curator_id;
  
  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Virtual Art Galleries
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore curated exhibitions from artists around the world
          </p>
        </div>
        
        {/* Search and Filters */}
        <div className="mb-10 bg-white rounded-lg shadow p-4">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search galleries by name or curator..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-rose-500 text-white rounded-md hover:bg-rose-600 transition-colors"
            >
              Search
            </button>
          </form>
          
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center space-x-2 text-gray-700">
              <Filter className="h-5 w-5" />
              <span className="font-medium">Filter by:</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {availableTags.slice(0, 10).map((tag) => (
                <button
                  key={tag}
                  onClick={() => setFilters({ ...filters, tag: filters.tag === tag ? '' : tag })}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    filters.tag === tag
                      ? 'bg-rose-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="ml-auto flex items-center text-rose-500 hover:text-rose-600 text-sm"
              >
                <X className="h-4 w-4 mr-1" />
                Clear filters
              </button>
            )}
          </div>
        </div>
        
        {/* Results Count */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-gray-600">
            {pagination.total} {pagination.total === 1 ? 'gallery' : 'galleries'} found
          </p>
        </div>
        
        {/* Gallery Grid */}
        {isLoading && galleries.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-lg overflow-hidden shadow-md bg-white">
                <div className="h-48 bg-gray-200 animate-pulse" />
                <div className="p-4">
                  <div className="h-6 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : galleries.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {galleries.map((gallery) => (
              <GalleryCard key={gallery.id} gallery={gallery} />
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">No galleries found</p>
            <p className="text-gray-400">Try changing your search or filters</p>
          </div>
        )}
        
        {/* Load More */}
        {pagination.hasMore && (
          <div className="mt-10 text-center">
            <button
              onClick={handleLoadMore}
              disabled={isLoading}
              className={`px-6 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Galleries;