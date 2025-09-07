import React from "react";
import { Product } from "../../types";
import { Link } from "react-router-dom";

interface ProductGridProps {
  products: Product[];
}

const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl text-gray-300 mb-4">
          <i className="fas fa-search"></i>
        </div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No products found</h3>
        <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 group"
        >
          {/* Product Image */}
          <div className="relative overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            
            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {product.is_new && (
                <span className="bg-primary text-black px-2 py-1 rounded-full text-xs font-bold">
                  NEW
                </span>
              )}
              {product.discount && product.discount > 0 && (
                <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                  -{product.discount}%
                </span>
              )}
            </div>
            
            {/* Stock Status */}
            <div className="absolute top-3 right-3">
              {product.stock && product.stock > 0 ? (
                product.stock <= 5 && (
                  <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    Low Stock
                  </span>
                )
              ) : (
                <span className="bg-gray-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                  Out of Stock
                </span>
              )}
            </div>
            
            {/* Quick View Button */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <Link
                to={`/product/${product.id}`}
                className="bg-white text-gray-800 px-4 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors"
              >
                View Details
              </Link>
            </div>
          </div>
          
          {/* Product Content */}
          <div className="p-4">
            {/* Category */}
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              {product.category}
            </p>
            
            {/* Product Name */}
            <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            
            {/* Description */}
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {product.description}
            </p>
            
            {/* Rating */}
            {product.rating && (
              <div className="flex items-center mb-3">
                <div className="flex text-yellow-400 text-sm">
                  {[...Array(5)].map((_, i) => (
                    <i
                      key={i}
                      className={`fas fa-star ${
                        i < Math.floor(product.rating || 0) ? "text-yellow-400" : "text-gray-300"
                      }`}
                    ></i>
                  ))}
                </div>
                <span className="text-xs text-gray-500 ml-1">
                  ({product.review_count})
                </span>
              </div>
            )}
            
            {/* Price */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-gray-800">
                  ${product.price.toFixed(2)}
                </span>
                {product.original_price && product.original_price > product.price && (
                  <span className="text-sm text-gray-500 line-through">
                    ${product.original_price.toFixed(2)}
                  </span>
                )}
              </div>
              
              {/* Add to Cart Button */}
              <button
                className="bg-primary text-black px-3 py-1 rounded-full text-sm font-semibold hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!product.stock || product.stock === 0}
              >
                <i className="fas fa-shopping-cart mr-1"></i>
                Add to Cart
              </button>
            </div>
            
            {/* Stock Info */}
            {product.stock !== undefined && (
              <div className="mt-2">
                <p className="text-xs text-gray-500">
                  {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                </p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductGrid;