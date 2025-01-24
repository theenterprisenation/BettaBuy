import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBasket, Menu, X, ShoppingCart } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useContent } from '../../contexts/ContentContext';
import { useCart } from '../../contexts/CartContext';
import { CartDropdown } from '../cart/CartDropdown';

export function Navbar() {
  const { user, signOut, isAdmin } = useAuth();
  const { content } = useContent();
  const { totalItems } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const mainMenu = content.main_menu?.value || [];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link 
            to="/" 
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <ShoppingBasket className="h-8 w-8 text-primary-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 text-transparent bg-clip-text">
              Foodrient
            </span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            {mainMenu.map((item: { label: string; path: string }) => (
              <Link 
                key={item.path} 
                to={item.path}
                className={`relative py-2 text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'text-primary-600'
                    : 'text-gray-600 hover:text-primary-500'
                }`}
              >
                {item.label}
                {isActive(item.path) && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-500 rounded-full" />
                )}
              </Link>
            ))}
            {user ? (
              <div className="flex items-center space-x-4 ml-4">
                <div className="relative">
                  <button
                    onClick={() => setIsCartOpen(!isCartOpen)}
                    className="p-2 hover:bg-gray-100 rounded-full relative"
                  >
                    <ShoppingCart className="h-6 w-6 text-gray-600" />
                    {totalItems > 0 && (
                      <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {totalItems}
                      </span>
                    )}
                  </button>
                  <CartDropdown isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
                </div>
                {isAdmin && (
                  <Link to="/admin">
                    <Button 
                      variant="outline"
                      className="hover:bg-primary-50 transition-colors"
                    >
                      Admin Dashboard
                    </Button>
                  </Link>
                )}
                <Link to="/dashboard">
                  <Button 
                    variant="outline"
                    className="hover:bg-primary-50 transition-colors"
                  >
                    My Orders
                  </Button>
                </Link>
                <Button 
                  variant="danger"
                  className="hover:bg-danger-600 transition-colors"
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button 
                variant="primary"
                className="hover:bg-primary-700 transition-colors"
                onClick={() => navigate('/auth')}
              >
                Sign In
              </Button>
            )}
          </div>

          <button 
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-gray-600" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-2 absolute top-16 left-0 right-0 bg-white shadow-lg border-t border-gray-100">
            {mainMenu.map((item: { label: string; path: string }) => (
              <Link 
                key={item.path}
                to={item.path} 
                className={`block px-4 py-2 text-sm font-medium ${
                  isActive(item.path)
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-600 hover:bg-gray-50'
                } transition-colors`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {user ? (
              <>
                <button
                  onClick={() => {
                    setIsCartOpen(!isCartOpen);
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Cart ({totalItems})
                </button>
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className="block px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                )}
                <Link 
                  to="/dashboard" 
                  className="block px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Orders
                </Link>
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm font-medium text-danger-600 hover:bg-danger-50 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="block px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}