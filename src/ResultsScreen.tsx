import React, { useState } from 'react';
import { useProductSearch, useShopNavigation } from '@shopify/shop-minis-react';
import CameraScreen from './CameraScreen';

interface Product {
  id: string;
  title: string;
  imageUrl: string;
  price: number;
  onlineStoreUrl?: string;
}

interface ResultsScreenProps {
  features: string[];
  onTryAgain: () => void;
  capturedImage?: string | null;
}

type SortOption = 'price-asc' | 'price-desc' | 'alpha-asc' | 'alpha-desc';

const ResultsScreen: React.FC<ResultsScreenProps> = ({ features, onTryAgain, capturedImage }) => {
  const [activeFeatures, setActiveFeatures] = useState(features);
  const [sortOption, setSortOption] = useState<SortOption>('price-asc');
  const { navigateToProduct } = useShopNavigation();
  const query = activeFeatures.join(' ');
  const { products, loading, error } = useProductSearch({ query });

  const removeFeature = (featureToRemove: string) => {
    setActiveFeatures(activeFeatures.filter(f => f !== featureToRemove));
  };

  const sortedProducts = (products ?? []).slice().sort((a, b) => {
    const priceA = Number(a.price?.amount ?? 0);
    const priceB = Number(b.price?.amount ?? 0);
    switch (sortOption) {
      case 'price-asc':
        return priceA - priceB;
      case 'price-desc':
        return priceB - priceA;
      case 'alpha-asc':
        return (a.title ?? '').localeCompare(b.title ?? '');
      case 'alpha-desc':
        return (b.title ?? '').localeCompare(a.title ?? '');
      default:
        return 0;
    }
  });

  const handleProductClick = (productId?: string) => {
    if (productId) {
      navigateToProduct({ productId });
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col p-4">
      {capturedImage && (
        <div className="flex justify-center mb-4">
          <img src={capturedImage} alt="Selfie" className="w-32 h-32 object-cover rounded-full shadow-lg" />
        </div>
      )}
      <div className="flex-1 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-center">Features Detected</h2>
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {activeFeatures.length > 0 ? (
            activeFeatures.map((feature, idx) => (
              <span key={idx} className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                {feature}
                <button
                  className="ml-2 text-blue-500 hover:text-red-500 focus:outline-none"
                  onClick={() => removeFeature(feature)}
                  aria-label={`Remove ${feature}`}
                >
                  ×
                </button>
              </span>
            ))
          ) : (
            <span className="text-gray-400">No features detected.</span>
          )}
        </div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-center flex-1">Recommended Products</h2>
          <select
            className="ml-4 px-2 py-1 border rounded text-sm"
            value={sortOption}
            onChange={e => setSortOption(e.target.value as SortOption)}
          >
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="alpha-asc">Alphabetical: A-Z</option>
            <option value="alpha-desc">Alphabetical: Z-A</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-8">
          {loading ? (
            <span className="col-span-2 text-gray-400 text-center">Loading products...</span>
          ) : error ? (
            <span className="col-span-2 text-red-500 text-center">Error loading products.</span>
          ) : sortedProducts.length > 0 ? (
            sortedProducts.map(product => (
              <button
                key={product.id}
                type="button"
                className="w-full h-36 bg-gray-50 rounded-lg shadow p-2 flex flex-col items-center justify-center focus:outline-none hover:bg-blue-100 active:bg-blue-200 transition cursor-pointer border border-transparent focus:ring-2 focus:ring-blue-400"
                onClick={() => handleProductClick(product.id)}
                aria-label={`View and buy ${product.title}`}
              >
                <img src={product.featuredImage?.url ?? ''} alt={product.title ?? ''} className="w-20 h-20 object-cover rounded mb-2" />
                <span className="text-sm text-center font-medium line-clamp-2">{product.title}</span>
                <span className="text-xs text-gray-500 mt-1">${Number(product.price?.amount ?? 0).toFixed(2)}</span>
              </button>
            ))
          ) : (
            <span className="col-span-2 text-gray-400 text-center">No products to recommend.</span>
          )}
        </div>
      </div>
      <button
        className="mt-auto w-full py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition"
        onClick={onTryAgain}
      >
        Try Again
      </button>
    </div>
  );
};

export default ResultsScreen; 