
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Menu, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Close mobile menu when route changes
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSignIn = () => {
    navigate('/admin');
  };

  const navLinks = [
    {
      name: 'Home',
      path: '/'
    },
    {
      name: 'Destinations',
      path: '/destinations'
    },
    {
      name: 'What\'s Your Travel Type?',
      path: '/quiz'
    },
    {
      name: 'About',
      path: '/about'
    },
    {
      name: 'Contact',
      path: '/contact'
    }
  ];

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      isScrolled 
        ? 'bg-white/80 backdrop-blur-lg shadow-sm dark:bg-gray-900/80' 
        : 'bg-transparent'
    )}>
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center group flex-shrink-0">
            <img 
              src="/lovable-uploads/2b127b7a-f8e2-4ed9-b75a-f14f4e215484.png" 
              alt="NexYatra" 
              className="h-12 lg:h-16 w-auto transition-all duration-300 group-hover:scale-105 drop-shadow-lg filter brightness-150" 
            />
          </Link>

          {/* Desktop Navigation - Centered */}
          <nav className="hidden lg:flex items-center justify-center flex-1 mx-8">
            <div className="flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    'text-sm font-medium hover-underline transition-colors whitespace-nowrap',
                    location.pathname === link.path 
                      ? 'text-primary' 
                      : 'text-foreground/80 hover:text-foreground'
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </nav>

          {/* Search & Login - Desktop */}
          <div className="hidden lg:flex items-center space-x-4 flex-shrink-0">
            <button className="p-2 rounded-full hover:bg-accent transition-colors">
              <Search size={20} />
            </button>
            <Button 
              variant="default" 
              size="sm" 
              className="rounded-full px-6"
              onClick={handleSignIn}
            >
              Sign In
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden p-2 rounded-full hover:bg-accent transition-colors flex-shrink-0" 
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={cn(
          'lg:hidden fixed inset-x-0 bg-background border-t border-border transition-all duration-300 z-50',
          isMobileMenuOpen 
            ? 'opacity-100 visible top-16' 
            : 'opacity-0 invisible top-16'
        )}>
          <div className="container-custom py-6 flex flex-col space-y-6">
            {/* Search - Mobile */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
              <input 
                type="search" 
                placeholder="Search destinations..." 
                className="w-full bg-muted rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary" 
              />
            </div>

            {/* Nav Links - Mobile */}
            <nav className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    'py-2 px-3 rounded-md transition-colors font-medium',
                    location.pathname === link.path 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-foreground hover:bg-accent'
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Auth - Mobile */}
            <div className="pt-4 border-t border-border">
              <Button variant="default" className="w-full" onClick={handleSignIn}>
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
