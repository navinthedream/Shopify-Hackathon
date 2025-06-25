import React, { useState } from 'react';

interface Product {
  id: string;
  title: string;
  imageUrl: string;
}

interface ResultsScreenProps {
  features: string[];
  products: Product[];
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ features, products }) => {
  const [activeFeatures, setActiveFeatures] = useState(features);

  const removeFeature = (featureToRemove: string) => {
    setActiveFeatures(activeFeatures.filter(f => f !== featureToRemove));
  };

  return (
    <div className="min-h-screen bg-white flex flex-col p-4">
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
      <h2 className="text-xl font-bold mb-4 text-center">Recommended Products</h2>
      <div className="grid grid-cols-2 gap-4">
        {products.length > 0 ? (
          products.map(product => (
            <div key={product.id} className="bg-gray-50 rounded-lg shadow p-2 flex flex-col items-center">
              <img src={product.imageUrl} alt={product.title} className="w-20 h-20 object-cover rounded mb-2" />
              <span className="text-sm text-center font-medium">{product.title}</span>
            </div>
          ))
        ) : (
          <span className="col-span-2 text-gray-400 text-center">No products to recommend.</span>
        )}
      </div>
    </div>
  );
};

export default ResultsScreen; 