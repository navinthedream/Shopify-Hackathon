import { useState } from 'react';
import { usePopularProducts } from '@shopify/shop-minis-react';
import CameraScreen from './CameraScreen';
import ResultsScreen from './ResultsScreen';
import { FalBagelAnalyzer } from './FalBagelAnalyzer';

// IMPORTANT: Set your Fal API key in a .env file as VITE_FAL_KEY=your_actual_fal_api_key

export function App() {
  const [showResults, setShowResults] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [features, setFeatures] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const FAL_KEY = import.meta.env.VITE_FAL_KEY;

  // Fetch real Shopify products
  const { products: shopifyProducts } = usePopularProducts();

  // Map Shopify products to your ResultsScreen format
  const products = (shopifyProducts ?? []).map((p: any) => ({
    id: p.id,
    title: p.title,
    imageUrl: p.featuredImage?.url || '',
    price: Number(p.price?.amount ?? p.priceRange?.minVariantPrice?.amount ?? 0),
    onlineStoreUrl: p.onlineStoreUrl,
  }));

  const handleCapture = async (image: { url: string; blob?: Blob }) => {
    setCapturedImage(image.url);
    setLoading(true);
    setError(null);
    setFeatures([]);
    try {
      if (!FAL_KEY) throw new Error('FAL API key is not set. Please set VITE_FAL_KEY in your .env file.');
      const analyzer = new FalBagelAnalyzer({ apiKey: FAL_KEY });
      // Prefer blob if available, else use base64 url
      const imgInput = image.blob || image.url;
      const result = await analyzer.analyze({ image: imgInput });
      setFeatures(result.features || []);
      setShowResults(true);
    } catch (err: any) {
      setError(err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };
  const handleTryAgain = () => {
    setShowResults(false);
    setFeatures([]);
    setCapturedImage(null);
    setError(null);
  };
  const handleCancel = () => setShowResults(true);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-lg font-semibold mb-2">Analyzing your selfie...</div>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-600 font-semibold mb-2">{error}</div>
        <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={handleTryAgain}>Try Again</button>
      </div>
    );
  }

  return showResults ? (
    <ResultsScreen
      features={features}
      onTryAgain={handleTryAgain}
      capturedImage={capturedImage}
    />
  ) : (
    <CameraScreen onCapture={handleCapture} onCancel={handleCancel} />
  );
}
