import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload as UploadIcon, X, Image } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

const ArtistUpload = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    medium: '',
    dimensions: ''
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Dropzone configuration
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
        
        // Create preview
        const objectUrl = URL.createObjectURL(acceptedFiles[0]);
        setPreview(objectUrl);
      }
    },
    onDropRejected: (fileRejections) => {
      const rejection = fileRejections[0];
      if (rejection.errors[0].code === 'file-too-large') {
        setError('File is too large. Maximum size is 5MB.');
      } else if (rejection.errors[0].code === 'file-invalid-type') {
        setError('Invalid file type. Please upload an image file.');
      } else {
        setError('File upload failed. Please try again.');
      }
    }
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please upload an image for your artwork.');
      return;
    }
    
    if (!formData.title || !formData.medium) {
      setError('Title and medium are required.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    const submitData = new FormData();
    submitData.append('title', formData.title);
    submitData.append('description', formData.description);
    submitData.append('medium', formData.medium);
    submitData.append('dimensions', formData.dimensions);
    submitData.append('image', file);
    
    try {
      await axios.post('/artworks', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Show success message
      window.showToast('Artwork submitted successfully!', 'success');
      
      // Redirect to submissions page
      navigate('/artist/submissions');
    } catch (err: any) {
      console.error('Submission error:', err);
      setError(err.response?.data?.message || 'Failed to submit artwork. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const clearImage = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setFile(null);
    setPreview(null);
  };
  
  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-100">
            <h1 className="text-2xl font-bold text-gray-900">Submit New Artwork</h1>
            <p className="text-gray-600 mt-1">
              Complete the form below to submit your artwork for review
            </p>
          </div>
          
          {error && (
            <div className="mx-6 mt-6 p-4 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder="Enter artwork title"
                />
              </div>
              
              <div>
                <label htmlFor="medium" className="block text-sm font-medium text-gray-700 mb-1">
                  Medium *
                </label>
                <select
                  id="medium"
                  name="medium"
                  value={formData.medium}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                >
                  <option value="">Select medium</option>
                  <option value="Digital Painting">Digital Painting</option>
                  <option value="Digital Illustration">Digital Illustration</option>
                  <option value="3D Rendering">3D Rendering</option>
                  <option value="Digital Photography">Digital Photography</option>
                  <option value="Pixel Art">Pixel Art</option>
                  <option value="Vector Art">Vector Art</option>
                  <option value="Mixed Media">Mixed Media</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            
            <div className="mb-6">
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
                placeholder="Describe your artwork (technique, inspiration, etc.)"
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="dimensions" className="block text-sm font-medium text-gray-700 mb-1">
                Dimensions/Resolution
              </label>
              <input
                type="text"
                id="dimensions"
                name="dimensions"
                value={formData.dimensions}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="e.g., 1920x1080px, 3000x4000px"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Artwork Image *
              </label>
              
              {!preview ? (
                <div 
                  {...getRootProps()} 
                  className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
                    isDragActive 
                      ? 'border-rose-300 bg-rose-50' 
                      : 'border-gray-300 hover:border-rose-300 hover:bg-gray-50'
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="text-center">
                    <UploadIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-600">
                      {isDragActive
                        ? 'Drop your image here'
                        : 'Drag & drop your image here, or click to select'}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Supported formats: JPEG, PNG, GIF, WebP (max 5MB)
                    </p>
                  </div>
                </div>
              ) : (
                <div className="relative rounded-lg overflow-hidden border border-gray-200">
                  <img 
                    src={preview} 
                    alt="Preview" 
                    className="max-h-80 w-full object-contain bg-gray-100"
                  />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute top-2 right-2 p-1 bg-gray-900 bg-opacity-70 rounded-full text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                <span className="text-red-500">*</span> Required fields
              </p>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-2 bg-rose-500 text-white rounded-md font-medium ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-rose-600'
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Artwork'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ArtistUpload;