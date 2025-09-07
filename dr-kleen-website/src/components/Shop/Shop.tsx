import React, { useState, useEffect } from "react";
import { apiService } from "../../services/api";
import { Product, Banner } from "../../types";
import ProductGrid from "./ProductGrid";

const Shop: React.FC = () => {
  const categories = [
    "All Products",
    "Cleaning Machines",
    "Professional Tools",
    "Cleaning Supplies",
    "Safety Equipment",
  ];

  const [selectedCategory, setSelectedCategory] = useState("All Products");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 2000 });
  const [sortBy, setSortBy] = useState("name");
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Auto-slide banners
  useEffect(() => {
    if (banners.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [banners.length]);

  // Fetch data
  const fetchProducts = async () => {
    try {
      const params = {
        category: selectedCategory !== "All Products" ? selectedCategory : undefined,
        search: searchQuery || undefined,
        min_price: priceRange.min,
        max_price: priceRange.max,
        sort_by: sortBy === "price-low" ? "price" : sortBy === "price-high" ? "price" : "name",
        sort_order: sortBy === "price-high" ? "desc" as const : "asc" as const,
      };
      
      const data = await apiService.getProducts(params);
      setProducts(data);
      setError("");
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to fetch products. Please try again later.");
    }
  };

  const fetchBanners = async () => {
    try {
      const data = await apiService.getBanners();
      setBanners(data);
    } catch (error) {
      console.error("Error fetching banners:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchProducts(), fetchBanners()]);
      setLoading(false);
    };
    
    fetchData();
  }, [selectedCategory, searchQuery, priceRange, sortBy]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".filter-dropdown")) {
        setIsFilterDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner Slider */}
      {banners.length > 0 && (
        <div className="relative h-96 overflow-hidden">
          {banners.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-500 ${
                currentSlide === index ? "opacity-100" : "opacity-0"
              }`}
              style={{ backgroundColor: slide.bg_color }}
            >
              <div className="container mx-auto px-6 h-full flex items-center">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center w-full">
                  <div className="text-white">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 font-bree">
                      {slide.title}
                    </h2>
                    <p className="text-xl mb-6 opacity-90">
                      {slide.subtitle}
                    </p>
                    <div className="mb-8">
                      <span className="inline-block bg-white text-black px-6 py-2 rounded-full font-bold text-lg">
                        {slide.discount}
                      </span>
                    </div>
                    <button className="bg-white text-black font-semibold px-8 py-3 rounded-full hover:bg-gray-100 transition-colors shadow-lg">
                      Shop Now
                    </button>
                  </div>
                  <div className="hidden lg:block">
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="max-w-full h-auto rounded-lg shadow-xl"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <i className="fas fa-chevron-right"></i>
          </button>

          {/* Slide Indicators */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  currentSlide === index ? "bg-white" : "bg-white/30"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Product Section */}
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 font-bree mb-4">
            Professional Cleaning Equipment
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our extensive collection of professional cleaning equipment, supplies, 
            and tools trusted by cleaning professionals worldwide.
          </p>
        </div>

        {/* Filters and Categories */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          {/* Categories */}
          <div className="flex flex-wrap gap-3 mb-6">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? "bg-primary text-black"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative">
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="relative filter-dropdown">
              <button
                onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 focus:ring-2 focus:ring-primary flex items-center gap-2"
              >
                <i className="fas fa-filter"></i>
                Filter
              </button>
              {isFilterDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price Range
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="number"
                        value={priceRange.min}
                        onChange={(e) =>
                          setPriceRange({
                            ...priceRange,
                            min: Number(e.target.value),
                          })
                        }
                        className="w-20 px-2 py-1 border rounded text-sm"
                        placeholder="Min"
                      />
                      <span>-</span>
                      <input
                        type="number"
                        value={priceRange.max}
                        onChange={(e) =>
                          setPriceRange({
                            ...priceRange,
                            max: Number(e.target.value),
                          })
                        }
                        className="w-20 px-2 py-1 border rounded text-sm"
                        placeholder="Max"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sort By
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-2 py-1 border rounded text-sm"
                    >
                      <option value="name">Name</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
            {error}
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">Loading products...</p>
          </div>
        ) : (
          <ProductGrid products={products} />
        )}

        {/* Call to Action */}
        <div className="text-center mt-16 bg-gradient-to-r from-gradientStart to-gradientEnd rounded-xl p-12">
          <h2 className="text-3xl font-bold text-white mb-4 font-bree">
            Need Expert Advice?
          </h2>
          <p className="text-white/90 text-lg mb-6 max-w-2xl mx-auto">
            Our team of cleaning equipment specialists is here to help you
            choose the right tools for your needs.
          </p>
          <a
            href="#contact"
            className="inline-block bg-white text-primary font-semibold px-8 py-3 rounded-full hover:bg-gray-100 transition-colors shadow-lg"
          >
            Contact Our Experts
          </a>
        </div>
      </div>
    </div>
  );
};

export default Shop;