import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Palette, 
  Menu, 
  X, 
  LogOut, 
  User, 
  Home, 
  BookOpen, 
  Upload, 
  CheckSquare, 
  Layout as LayoutIcon,
  LayoutGrid
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isArtist, isCurator, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Handle scrolling effect
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Close mobile menu when navigating
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  return (
    <header 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white shadow-md py-2' 
          : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 text-2xl font-semibold"
          >
            <Palette className="h-8 w-8 text-rose-500" />
            <span className={`${scrolled ? 'text-gray-900' : 'text-gray-900'}`}>ArtShow</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`transition-colors hover:text-rose-500 ${
                location.pathname === '/' 
                  ? 'text-rose-500 font-medium' 
                  : scrolled ? 'text-gray-800' : 'text-gray-800'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/galleries" 
              className={`transition-colors hover:text-rose-500 ${
                location.pathname.includes('/galleries') 
                  ? 'text-rose-500 font-medium' 
                  : scrolled ? 'text-gray-800' : 'text-gray-800'
              }`}
            >
              Galleries
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link 
                  to="/dashboard" 
                  className={`transition-colors hover:text-rose-500 ${
                    location.pathname === '/dashboard' 
                      ? 'text-rose-500 font-medium' 
                      : scrolled ? 'text-gray-800' : 'text-gray-800'
                  }`}
                >
                  Dashboard
                </Link>
                
                <div className="relative group">
                  <button className="flex items-center space-x-1 hover:text-rose-500">
                    <span className={scrolled ? 'text-gray-800' : 'text-gray-800'}>
                      {user?.username}
                    </span>
                  </button>
                  
                  <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md overflow-hidden z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm text-gray-500">Signed in as</p>
                      <p className="text-sm font-medium">{user?.email}</p>
                    </div>
                    <div className="py-1">
                      <Link 
                        to="/profile" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Profile
                      </Link>
                      
                      {isArtist && (
                        <>
                          <Link 
                            to="/artist/submissions" 
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            My Submissions
                          </Link>
                          <Link 
                            to="/artist/upload" 
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Upload Artwork
                          </Link>
                        </>
                      )}
                      
                      {isCurator && (
                        <>
                          <Link 
                            to="/curator/review" 
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Review Artworks
                          </Link>
                          <Link 
                            to="/curator/galleries" 
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            My Galleries
                          </Link>
                        </>
                      )}
                      
                      <button 
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login" 
                  className="px-4 py-2 rounded-md bg-transparent border border-rose-500 text-rose-500 hover:bg-rose-50 transition-colors"
                >
                  Log In
                </Link>
                <Link 
                  to="/register" 
                  className="px-4 py-2 rounded-md bg-rose-500 text-white hover:bg-rose-600 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-gray-800"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="flex items-center space-x-2 py-2 text-gray-800 hover:text-rose-500"
              >
                <Home className="h-5 w-5" />
                <span>Home</span>
              </Link>
              <Link 
                to="/galleries" 
                className="flex items-center space-x-2 py-2 text-gray-800 hover:text-rose-500"
              >
                <BookOpen className="h-5 w-5" />
                <span>Galleries</span>
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className="flex items-center space-x-2 py-2 text-gray-800 hover:text-rose-500"
                  >
                    <LayoutIcon className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                  
                  <Link 
                    to="/profile" 
                    className="flex items-center space-x-2 py-2 text-gray-800 hover:text-rose-500"
                  >
                    <User className="h-5 w-5" />
                    <span>Profile</span>
                  </Link>
                  
                  {isArtist && (
                    <>
                      <Link 
                        to="/artist/submissions" 
                        className="flex items-center space-x-2 py-2 text-gray-800 hover:text-rose-500"
                      >
                        <LayoutGrid className="h-5 w-5" />
                        <span>My Submissions</span>
                      </Link>
                      <Link 
                        to="/artist/upload" 
                        className="flex items-center space-x-2 py-2 text-gray-800 hover:text-rose-500"
                      >
                        <Upload className="h-5 w-5" />
                        <span>Upload Artwork</span>
                      </Link>
                    </>
                  )}
                  
                  {isCurator && (
                    <>
                      <Link 
                        to="/curator/review" 
                        className="flex items-center space-x-2 py-2 text-gray-800 hover:text-rose-500"
                      >
                        <CheckSquare className="h-5 w-5" />
                        <span>Review Artworks</span>
                      </Link>
                      <Link 
                        to="/curator/galleries" 
                        className="flex items-center space-x-2 py-2 text-gray-800 hover:text-rose-500"
                      >
                        <LayoutGrid className="h-5 w-5" />
                        <span>My Galleries</span>
                      </Link>
                    </>
                  )}
                  
                  <button 
                    onClick={handleLogout}
                    className="flex items-center space-x-2 py-2 text-gray-800 hover:text-rose-500"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2 pt-2 border-t border-gray-100">
                  <Link 
                    to="/login" 
                    className="w-full py-2 text-center rounded-md border border-rose-500 text-rose-500 hover:bg-rose-50"
                  >
                    Log In
                  </Link>
                  <Link 
                    to="/register" 
                    className="w-full py-2 text-center rounded-md bg-rose-500 text-white hover:bg-rose-600"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;