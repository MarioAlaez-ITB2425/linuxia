
import React from 'react';

interface ImageViewerAppProps {
  image?: string;
}

const ImageViewerApp: React.FC<ImageViewerAppProps> = ({ image }) => {
  if (!image) return (
    <div className="flex items-center justify-center h-full text-zinc-500">
      No image data found.
    </div>
  );

  return (
    <div className="flex items-center justify-center h-full bg-zinc-950 p-4">
      <img 
        src={image} 
        alt="View" 
        className="max-w-full max-h-full object-contain shadow-2xl"
      />
    </div>
  );
};

export default ImageViewerApp;
