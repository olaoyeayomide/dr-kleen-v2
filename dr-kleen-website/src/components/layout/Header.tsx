import React, { useState } from "react";
import { Link } from "react-router-dom";

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <header className="relative bg-gradient-to-r from-gradientStart via-gradientMid to-gradientEnd shadow-lg z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3">
          <img
            src="https://i.ibb.co/LtcYFd9/Dr-Kleen-Logo2.png"
            alt="Dr-Kleen-Logo2"
            className="h-12 w-12"
          />
          <div>
            <h1 className="text-2xl font-bold text-white font-bree">
              Dr.Kleen
            </h1>
            <p className="text-xs text-white opacity-80">Cleaning service</p>
          </div>
        </Link>

        {/* Mobile Menu and Cart */}
        <div className="flex items-center space-x-4 md:hidden">
          <button
            onClick={() => setIsCartOpen(!isCartOpen)}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md"
          >
            <i className="fas fa-shopping-cart text-primary"></i>
          </button>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="focus:outline-none"
          >
            <i className="fas fa-bars text-white text-xl"></i>
          </button>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-8">
          <Link
            to="/"
            className="text-white hover:text-yellow-200 transition-colors font-medium"
          >
            Home
          </Link>
          <Link
            to="/shop"
            className="text-white hover:text-yellow-200 transition-colors font-medium"
          >
            Shop
          </Link>
          <a
            href="/#about"
            className="text-white hover:text-yellow-200 transition-colors font-medium"
          >
            About
          </a>
          <a
            href="/#services"
            className="text-white hover:text-yellow-200 transition-colors font-medium"
          >
            Services
          </a>
          <a
            href="/#contact"
            className="text-white hover:text-yellow-200 transition-colors font-medium"
          >
            Contact
          </a>
        </nav>

        {/* Desktop Search and Cart */}
        <div className="hidden md:flex items-center space-x-4">
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="Search products..."
              className="pl-10 pr-4 py-2 rounded-full border-2 border-white bg-white/90 focus:outline-none focus:bg-white"
            />
          </div>
          <button
            onClick={() => setIsCartOpen(!isCartOpen)}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md"
          >
            <i className="fas fa-shopping-cart text-primary"></i>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-white z-50 md:hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-bold text-primary font-bree">Dr.Kleen</h2>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="text-xl"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          <nav className="flex flex-col space-y-4 p-6">
            <Link
              to="/"
              onClick={() => setIsMenuOpen(false)}
              className="text-gray-800 hover:text-primary transition-colors font-medium text-lg"
            >
              Home
            </Link>
            <Link
              to="/shop"
              onClick={() => setIsMenuOpen(false)}
              className="text-gray-800 hover:text-primary transition-colors font-medium text-lg"
            >
              Shop
            </Link>
            <a
              href="/#about"
              onClick={() => setIsMenuOpen(false)}
              className="text-gray-800 hover:text-primary transition-colors font-medium text-lg"
            >
              About
            </a>
            <a
              href="/#services"
              onClick={() => setIsMenuOpen(false)}
              className="text-gray-800 hover:text-primary transition-colors font-medium text-lg"
            >
              Services
            </a>
            <a
              href="/#contact"
              onClick={() => setIsMenuOpen(false)}
              className="text-gray-800 hover:text-primary transition-colors font-medium text-lg"
            >
              Contact
            </a>
          </nav>
        </div>
      )}

      {/* Cart Panel */}
      {isCartOpen && (
        <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-bold text-primary font-bree">Your Cart</h2>
            <button
              onClick={() => setIsCartOpen(false)}
              className="text-xl"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="p-6">
            <p className="text-gray-500">No items in the cart.</p>
          </div>
        </div>
      )}

      {/* Overlay */}
      {(isMenuOpen || isCartOpen) && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => {
            setIsMenuOpen(false);
            setIsCartOpen(false);
          }}
        ></div>
      )}
    </header>
  );
};

export default Header;