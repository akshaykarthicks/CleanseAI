
import React from 'react';

interface ImageViewerProps {
  label: string;
  src: string | null;
  children?: React.ReactNode;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({ label, src, children }) => {
  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl font-semibold text-gray-300 mb-3">{label}</h2>
      <div className="relative w-full aspect-square bg-[#0a0a0a] rounded-lg overflow-hidden border border-[#3e0000] flex items-center justify-center shadow-lg">
        {src ? (
          <img src={src} alt={label} className="object-contain w-full h-full" />
        ) : (
          <div className="text-gray-500">
            {children ? children : <p>Your cleansed image will appear here</p>}
          </div>
        )}
      </div>
    </div>
  );
};