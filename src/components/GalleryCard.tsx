import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, Heart } from 'lucide-react';

interface GalleryCardProps {
  gallery: {
    id: number;
    name: string;
    curator_name: string;
    artwork_count: number;
    view_count: number;
  };
  artwork?: {
    image_url: string;
  };
}

const GalleryCard = ({ gallery, artwork }: GalleryCardProps) => {
  const defaultImage = 'https://images.pexels.com/photos/1674049/pexels-photo-1674049.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';
  
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="rounded-lg overflow-hidden shadow-md bg-white"
    >
      <Link to={`/galleries/${gallery.id}`}>
        <div className="relative overflow-hidden group h-48">
          <img 
            src={artwork?.image_url || defaultImage}
            alt={gallery.name}
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-80" />
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-white font-semibold text-lg truncate">{gallery.name}</h3>
            <div className="flex items-center mt-1">
              <p className="text-white/90 text-sm">Curated by {gallery.curator_name}</p>
            </div>
          </div>
        </div>
      </Link>
      
      <div className="p-4">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span>{gallery.view_count}</span>
            </div>
            <div>
              <span>{gallery.artwork_count} {gallery.artwork_count === 1 ? 'artwork' : 'artworks'}</span>
            </div>
          </div>
          <Link 
            to={`/galleries/${gallery.id}`}
            className="text-rose-500 hover:text-rose-600 font-medium"
          >
            View Gallery
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default GalleryCard;