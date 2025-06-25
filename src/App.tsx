import { useState } from 'react';
import { usePopularProducts } from '@shopify/shop-minis-react';
import CameraScreen from './CameraScreen';
import ResultsScreen from './ResultsScreen';

export function App() {
  const [showResults, setShowResults] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const features = ['Oily skin', 'Curly hair', 'Oval face'];

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

  const handleCapture = (image: { url: string; blob?: Blob }) => {
    setCapturedImage(image.url);
    setShowResults(true);
  };
  const handleTryAgain = () => setShowResults(false);
  const handleCancel = () => setShowResults(true);

  return showResults ? (
    <ResultsScreen
      features={features}
      products={products}
      onTryAgain={handleTryAgain}
      capturedImage={capturedImage}
    />
  ) : (
    <CameraScreen onCapture={handleCapture} onCancel={handleCancel} />
  );
}
