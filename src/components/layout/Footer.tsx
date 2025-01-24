import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Foodrient</h3>
            <p className="text-sm">
              Revolutionizing group food buying in Nigeria. Save money, reduce waste, and build community through collective purchasing.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/products" className="text-sm hover:text-primary-500 transition-colors">
                  Browse Products
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-sm hover:text-primary-500 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm hover:text-primary-500 transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy" className="text-sm hover:text-primary-500 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm hover:text-primary-500 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-center text-sm">
                <Mail className="w-4 h-4 mr-2" />
                support@foodrient.com
              </li>
              <li className="flex items-center text-sm">
                <Phone className="w-4 h-4 mr-2" />
                +234 (0) 123 456 7890
              </li>
              <li className="flex items-center text-sm">
                <MapPin className="w-4 h-4 mr-2" />
                Lagos, Nigeria
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800">
          <p className="text-sm text-center">
            © {new Date().getFullYear()} Foodrient. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}