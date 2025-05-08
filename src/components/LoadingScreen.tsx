import { Palette } from 'lucide-react';

const LoadingScreen = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="flex items-center justify-center">
        <Palette className="h-16 w-16 text-rose-500 animate-pulse" />
      </div>
      <h1 className="text-2xl font-medium text-gray-800 mt-6 mb-2">ArtShow</h1>
      <p className="text-gray-500">Loading your experience...</p>
    </div>
  );
};

export default LoadingScreen;