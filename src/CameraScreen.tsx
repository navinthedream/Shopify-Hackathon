import { useEffect, useState } from 'react';
import { usePopularProducts, ProductCard } from '@shopify/shop-minis-react';

interface CameraScreenProps {
  onCapture?: (image: { url: string; blob?: Blob }) => void;
  onCancel?: () => void;
}

const CameraScreen: React.FC<CameraScreenProps> = ({ onCapture, onCancel }) => {
  const { products } = usePopularProducts();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const openCamera = async () => {
    try {
      console.log('Opening camera with AVFoundation...');
      // Try AVFoundation bridge methods
      const avMethods = [
        () => (window as any).AVFoundation?.capturePhoto(),
        () => (window as any).webkit?.messageHandlers?.camera?.postMessage({ action: 'capture' }),
        () => (window as any).ReactNativeWebView?.postMessage(JSON.stringify({ type: 'CAMERA_CAPTURE' })),
        () => (window as any).ShopApp?.camera?.capture(),
        () => (window as any).camera?.capture()
      ];
      for (const method of avMethods) {
        try {
          const result = await method();
          if (result) {
            console.log('AVFoundation result:', result);
            setCapturedImage(result.uri || result.path || result);
            if (onCapture) onCapture({ url: result.uri || result.path || result });
            return;
          }
        } catch (e) {
          console.log('Method failed:', e);
        }
      }
      // If no AVFoundation methods work, try HTML input
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            setCapturedImage(event.target?.result as string);
            if (onCapture) onCapture({ url: event.target?.result as string, blob: file });
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    } catch (error: any) {
      console.error('Camera error:', error);
      alert(`Camera error: ${error.message}`);
    }
  };

  // Auto-open camera when component mounts
  useEffect(() => {
    openCamera();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="pt-12 px-4 pb-6">
      <h1 className="text-2xl font-bold mb-2 text-center">
        📸 Selfie Shop!
      </h1>
      {/* Camera Button */}
      <div className="text-center mb-6">
        <button
          onClick={openCamera}
          className="bg-purple-600 text-white px-8 py-4 rounded-full text-xl font-bold"
        >
          📱 Take Selfie
        </button>
        {onCancel && (
          <button
            onClick={onCancel}
            className="ml-4 bg-gray-300 text-gray-800 px-6 py-4 rounded-full text-xl font-bold"
          >
            Cancel
          </button>
        )}
      </div>
      {/* Show captured image */}
      {capturedImage && (
        <div className="text-center mb-6">
          <img 
            src={capturedImage} 
            alt="Selfie" 
            className="max-w-xs mx-auto rounded-lg shadow-lg"
          />
        </div>
      )}
      {/* Products */}
      <div className="grid grid-cols-2 gap-4">
        {products?.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default CameraScreen; 