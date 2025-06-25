import React, { useRef } from 'react';
import { Camera, CameraElement } from 'react-use-camera';

interface CameraScreenProps {
  onCapture: (image: { url: string; blob: Blob }) => void;
}

const CameraScreen: React.FC<CameraScreenProps> = ({ onCapture }) => {
  const cameraRef = useRef<CameraElement>(null);

  const handleCapture = async () => {
    const imageData = await cameraRef.current?.capture();
    if (imageData && imageData.blob) {
      onCapture({ url: imageData.url, blob: imageData.blob });
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-black z-50">
      <div className="flex-1 relative">
        <Camera
          ref={cameraRef}
          className="w-full h-full object-cover"
          fit="cover"
          constraints={{ facingMode: 'user' }}
          errorLayout={<div className="text-white flex items-center justify-center h-full">Camera unavailable</div>}
        />
      </div>
      <div className="w-full flex justify-center py-6 bg-gradient-to-t from-black/80 to-transparent">
        <button
          className="w-20 h-20 rounded-full bg-white border-4 border-gray-300 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          onClick={handleCapture}
          aria-label="Capture photo"
        >
          <span className="block w-12 h-12 bg-gray-200 rounded-full" />
        </button>
      </div>
    </div>
  );
};

export default CameraScreen; 