import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

const CuratorCreateGallery = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear specific error when field is changed
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };
  
  const validate = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Gallery name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await axios.post('/galleries', {
        name: formData.name,
        description: formData.description || null
      });
      
      // Show success message
      window.showToast('Gallery created successfully!', 'success');
      
      // Redirect to edit page
      navigate(`/curator/galleries/${response.data.data.id}/edit`);
    } catch (err: any) {
      console.error('Gallery creation error:', err);
      setErrors({
        general: err.response?.data?.message || 'Failed to create gallery. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-100">
            <h1 className="text-2xl font-bold text-gray-900">Create New Gallery</h1>
            <p className="text-gray-600 mt-1">
              Set up a new virtual gallery to showcase approved artworks
            </p>
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
              
              <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  <span className="text-red-500">*</span> Required fields
                </p>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-2 bg-rose-500 text-white rounded-md font-medium inline-flex items-center ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-rose-600'
                  }`}
                >
                  {isSubmitting ? 'Creating...' : 'Create Gallery'}
                  {!isSubmitting && <CheckCircle className="ml-2 h-5 w-5" />}
                </button>
              </div>
            </div>
          </form>
          
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="ml-3 text-sm text-gray-600">
                After creating your gallery, you'll be able to add artworks, arrange them, and publish the gallery when ready.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CuratorCreateGallery;