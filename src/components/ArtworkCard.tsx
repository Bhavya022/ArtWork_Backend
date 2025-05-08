import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, Heart } from 'lucide-react';

interface ArtworkCardProps {
  artwork: {
    id: number;
    title: string;
    image_url: string;
    artist_name: string;
    view_count: number;
    like_count: number;
    medium?: string;
    tags?: string[];
  };
}

const ArtworkCard = ({ artwork }: ArtworkCardProps) => {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="rounded-lg overflow-hidden shadow-md bg-white"
    >
      <Link to={`/artworks/${artwork.id}`}>
        <div className="relative overflow-hidden group h-52">
          <img 
            src={artwork.image_url}
            alt={artwork.title}
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute bottom-4 left-4 right-4 transform translate-y-full group-hover:translate-y-0 transition-transform">
            <h3 className="text-white font-semibold text-lg truncate">{artwork.title}</h3>
            <div className="flex items-center mt-1">
              <p className="text-white/90 text-sm">by {artwork.artist_name}</p>
            </div>
          </div>
        </div>
      </Link>
      
      <div className="p-4">
        <h3 className="font-medium text-gray-900 mb-1 truncate">
          {artwork.title}
        </h3>
        <p className="text-gray-500 text-sm mb-2">by {artwork.artist_name}</p>
        
        {artwork.medium && (
          <p className="text-sm text-gray-500 mb-2">{artwork.medium}</p>
        )}
        
        {artwork.tags && artwork.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {artwork.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
              >
                {tag}
              </span>
            ))}
            {artwork.tags.length > 3 && (
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                +{artwork.tags.length - 3}
              </span>
            )}
          </div>
        )}
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span>{artwork.view_count}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Heart className="h-4 w-4" />
              <span>{artwork.like_count}</span>
            </div>
          </div>
          <Link 
            to={`/artworks/${artwork.id}`}
            className="text-rose-500 hover:text-rose-600 font-medium"
          >
            View
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default ArtworkCard;