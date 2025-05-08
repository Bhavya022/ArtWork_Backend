import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Components
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import Galleries from './pages/Galleries';
import GalleryDetail from './pages/GalleryDetail';
import ArtworkDetail from './pages/ArtworkDetail';
import Dashboard from './pages/Dashboard';
import ArtistSubmissions from './pages/artist/Submissions';
import ArtistUpload from './pages/artist/Upload';
import CuratorReview from './pages/curator/Review';
import CuratorGalleries from './pages/curator/Galleries';
import CuratorCreateGallery from './pages/curator/CreateGallery';
import CuratorEditGallery from './pages/curator/EditGallery';
//import Profile from './pages/Profile';

function App() {
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Layout />}>
          {/* Public Routes */}
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="galleries" element={<Galleries />} />
          <Route path="galleries/:id" element={<GalleryDetail />} />
          <Route path="artworks/:id" element={<ArtworkDetail />} />
          
          {/* Protected Routes */}
          <Route path="dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
         
          
          {/* Artist Routes */}
          <Route path="artist/submissions" element={
            <ProtectedRoute requiredRole="artist">
              <ArtistSubmissions />
            </ProtectedRoute>
          } />
          
          <Route path="artist/upload" element={
            <ProtectedRoute requiredRole="artist">
              <ArtistUpload />
            </ProtectedRoute>
          } />
          
          {/* Curator Routes */}
          <Route path="curator/review" element={
            <ProtectedRoute requiredRole="curator">
              <CuratorReview />
            </ProtectedRoute>
          } />
          
          <Route path="curator/galleries" element={
            <ProtectedRoute requiredRole="curator">
              <CuratorGalleries />
            </ProtectedRoute>
          } />
          
          <Route path="curator/galleries/create" element={
            <ProtectedRoute requiredRole="curator">
              <CuratorCreateGallery />
            </ProtectedRoute>
          } />
          
          <Route path="curator/galleries/:id/edit" element={
            <ProtectedRoute requiredRole="curator">
              <CuratorEditGallery />
            </ProtectedRoute>
          } />
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

export default App;