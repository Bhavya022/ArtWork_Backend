import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ChevronRight, Palette, Upload, CheckSquare, BookOpen } from 'lucide-react';
import GalleryCard from '../components/GalleryCard';
import ArtworkCard from '../components/ArtworkCard';

interface Gallery {
  id: number;
  name: string;
  curator_name: string;
  artwork_count: number;
  view_count: number;
}

interface Artwork {
  id: number;
  title: string;
  image_url: string;
  artist_name: string;
  view_count: number;
  like_count: number;
  medium?: string;
  tags?: string[];
}

interface SiteStats {
  totals: {
    total_artworks: number;
    total_artists: number;
    total_galleries: number;
  };
  top_galleries: Gallery[];
  top_artworks: Artwork[];
}

const Home = () => {
  const [stats, setStats] = useState<SiteStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/analytics/site');
        setStats(response.data.data);
      } catch (error) {
        console.error('Error fetching site stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
            >
              Discover Digital Art Exhibitions
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-gray-300 mb-10"
            >
              Explore curated virtual galleries from artists around the world, or submit your own digital artwork for exhibition.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col sm:flex-row justify-center gap-4"
            >
              <Link
                to="/galleries"
                className="px-8 py-3 bg-rose-500 hover:bg-rose-600 rounded-md font-medium transition-colors"
              >
                Browse Galleries
              </Link>
              <Link
                to="/register"
                className="px-8 py-3 bg-transparent border border-white hover:bg-white/10 rounded-md font-medium transition-colors"
              >
                Join as Artist or Curator
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <Palette className="h-12 w-12 text-rose-500 mx-auto mb-4" />
              <h2 className="text-4xl font-bold text-gray-900 mb-2">
                {stats?.totals.total_artworks || 0}
              </h2>
              <p className="text-gray-600">Artworks</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <Upload className="h-12 w-12 text-indigo-500 mx-auto mb-4" />
              <h2 className="text-4xl font-bold text-gray-900 mb-2">
                {stats?.totals.total_artists || 0}
              </h2>
              <p className="text-gray-600">Artists</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <BookOpen className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h2 className="text-4xl font-bold text-gray-900 mb-2">
                {stats?.totals.total_galleries || 0}
              </h2>
              <p className="text-gray-600">Galleries</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Galleries */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Featured Galleries</h2>
            <Link 
              to="/galleries" 
              className="flex items-center text-rose-500 hover:text-rose-600 font-medium"
            >
              View All
              <ChevronRight className="h-5 w-5 ml-1" />
            </Link>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-lg overflow-hidden shadow-md bg-white">
                  <div className="h-48 bg-gray-200 animate-pulse" />
                  <div className="p-4">
                    <div className="h-6 bg-gray-200 rounded animate-pulse mb-2" />
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {stats?.top_galleries.slice(0, 3).map((gallery) => (
                <GalleryCard key={gallery.id} gallery={gallery} />
              ))}
            </div>
          )}
        </div>
      </section>
      
      {/* Featured Artworks */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Trending Artworks</h2>
            <Link 
              to="/artworks" 
              className="flex items-center text-rose-500 hover:text-rose-600 font-medium"
            >
              View All
              <ChevronRight className="h-5 w-5 ml-1" />
            </Link>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-lg overflow-hidden shadow-md bg-white">
                  <div className="h-48 bg-gray-200 animate-pulse" />
                  <div className="p-4">
                    <div className="h-6 bg-gray-200 rounded animate-pulse mb-2" />
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats?.top_artworks.slice(0, 4).map((artwork) => (
                <ArtworkCard key={artwork.id} artwork={artwork} />
              ))}
            </div>
          )}
        </div>
      </section>
      
      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-16">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="relative">
                <div className="h-16 w-16 bg-rose-500 text-white rounded-full flex items-center justify-center mx-auto mb-6">
                  <Upload className="h-8 w-8" />
                </div>
                <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-rose-200" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Upload Artworks</h3>
              <p className="text-gray-600">
                Artists submit digital artworks with details like title, description, and medium.
              </p>
            </div>
            
            <div className="text-center">
              <div className="relative">
                <div className="h-16 w-16 bg-rose-500 text-white rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckSquare className="h-8 w-8" />
                </div>
                <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-rose-200" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Curators Review</h3>
              <p className="text-gray-600">
                Curators review submissions, approve artworks, and tag them by style or theme.
              </p>
            </div>
            
            <div className="text-center">
              <div className="h-16 w-16 bg-rose-500 text-white rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Exhibit in Galleries</h3>
              <p className="text-gray-600">
                Approved artworks are exhibited in curated virtual galleries for viewers to explore.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-16 bg-rose-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Showcase Your Art?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join our community of artists and curators to share your digital artwork with the world.
          </p>
          <Link
            to="/register"
            className="px-8 py-3 bg-white text-rose-500 hover:bg-gray-100 rounded-md font-medium transition-colors inline-block"
          >
            Get Started
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;