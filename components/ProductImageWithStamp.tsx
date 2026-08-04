'use client';

import React, { useState, useEffect } from 'react';
import { createStampedImage } from '../utils/imageWatermark';

interface ProductImageWithStampProps {
  src: string;
  alt: string;
  className?: string;
}

export const ProductImageWithStamp: React.FC<ProductImageWithStampProps> = ({
  src,
  alt,
  className = 'w-full h-full object-cover',
}) => {
  const [stampedSrc, setStampedSrc] = useState<string>(src);

  useEffect(() => {
    let isMounted = true;
    if (!src) return;

    // Bake the stamp directly into the image pixel canvas
    createStampedImage(src, { opacity: 0.38 }).then((result) => {
      if (isMounted && result) {
        setStampedSrc(result);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [src]);

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-slate-100 dark:bg-carbon-950">
      {/* 
        This <img> tag renders the canvas-stamped image directly!
        When right-clicked or saved by the user, the downloaded file
        PERMANENTLY contains the 'سوق البالات' stamp and QR barcode in the image bytes!
      */}
      <img
        src={stampedSrc}
        alt={alt}
        className={className}
        style={{ userSelect: 'auto' }}
      />
    </div>
  );
};
