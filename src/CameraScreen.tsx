import React, { useRef, useEffect } from 'react';
import { Camera, CameraElement } from 'react-use-camera';

interface CameraScreenProps {
  onCapture: (image: { url: string; blob: Blob }) => void;
  onCancel: () => void;
}

const CameraScreen: React.FC<CameraScreenProps> = ({ onCapture, onCancel }) => {
  const cameraRef = useRef<CameraElement>(null);

  const handleCapture = async () => {
    const imageData = await cameraRef.current?.capture();
    if (imageData && imageData.blob) {
      onCapture({ url: imageData.url, blob: imageData.blob });
    }
  };

  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true }).catch(() => {});
    }
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col bg-black z-50">
      <div className="flex-1 relative">
        <button
          className="absolute top-4 left-4 z-10 w-10 h-10 flex items-center justify-center bg-black/60 rounded-full text-white text-2xl font-bold hover:bg-black/80 focus:outline-none"
          onClick={onCancel}
          aria-label="Cancel and return"
        >
          ×
        </button>
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