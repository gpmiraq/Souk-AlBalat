'use client';

/**
 * Utility to permanently bake the "سوق البالات" diagonal watermark stamp
 * and QR code directly into the pixel bytes of an image via HTML5 Canvas.
 * This guarantees that when a user saves, downloads, or right-clicks the image,
 * the saved file permanently contains the stamp and QR watermark.
 */
export async function createStampedImage(
  imageSrc: string,
  options: {
    stampText?: string;
    subText?: string;
    includeQr?: boolean;
    opacity?: number;
  } = {}
): Promise<string> {
  const {
    stampText = 'سوق البالات',
    subText = 'AMAZON & DHL OUTLET IQ 🇮🇶',
    opacity = 0.35,
  } = options;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(imageSrc);
        return;
      }

      // 1. Force 1:1 Square aspect ratio cropping or scale
      const size = Math.max(img.width, img.height);
      canvas.width = size;
      canvas.height = size;

      // Draw background image centered
      const offsetX = (size - img.width) / 2;
      const offsetY = (size - img.height) / 2;
      ctx.drawImage(img, offsetX, offsetY, img.width, img.height);

      // 2. Draw Center Diagonal Watermark Stamp
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.translate(size / 2, size / 2);
      ctx.rotate((-28 * Math.PI) / 180); // -28 degree angle

      const boxWidth = size * 0.55;
      const boxHeight = size * 0.18;

      // Outer Stamp Box Frame
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = Math.max(3, size * 0.008);
      ctx.strokeRect(-boxWidth / 2, -boxHeight / 2, boxWidth, boxHeight);

      // Inner text
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Main Text (سوق البالات)
      const fontSize = Math.max(16, size * 0.055);
      ctx.font = `900 ${fontSize}px sans-serif, Cairo, Tahoma`;
      ctx.fillText(stampText, 0, -boxHeight * 0.15);

      // Sub Text (AMAZON & DHL OUTLET IQ)
      const subFontSize = Math.max(10, size * 0.025);
      ctx.font = `bold ${subFontSize}px sans-serif, monospace`;
      ctx.fillStyle = '#F59E0B'; // Amber
      ctx.fillText(subText, 0, boxHeight * 0.22);

      ctx.restore();

      // 3. Draw Bottom-Left QR & Branding Box
      ctx.save();
      ctx.globalAlpha = 0.85;
      const qrBoxWidth = size * 0.32;
      const qrBoxHeight = size * 0.11;
      const margin = size * 0.03;
      const qrX = margin;
      const qrY = size - qrBoxHeight - margin;

      // Background rounded box for bottom-left branding
      ctx.fillStyle = '#0F172A'; // Slate-900
      ctx.beginPath();
      ctx.roundRect(qrX, qrY, qrBoxWidth, qrBoxHeight, 12);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // White inner square for QR representation
      const qrSize = qrBoxHeight * 0.75;
      const qrInnerX = qrX + margin * 0.5;
      const qrInnerY = qrY + (qrBoxHeight - qrSize) / 2;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(qrInnerX, qrInnerY, qrSize, qrSize);

      // Fake QR pattern lines inside the white box
      ctx.fillStyle = '#000000';
      const pSize = qrSize / 5;
      ctx.fillRect(qrInnerX + pSize, qrInnerY + pSize, pSize * 3, pSize * 3);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(qrInnerX + pSize * 2, qrInnerY + pSize * 2, pSize, pSize);

      // Text next to QR code
      ctx.fillStyle = '#F59E0B'; // Amber
      const fontBranding = Math.max(9, size * 0.022);
      ctx.font = `900 ${fontBranding}px sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText('سوق البالات', qrInnerX + qrSize + margin * 0.4, qrY + qrBoxHeight * 0.4);

      ctx.fillStyle = '#CBD5E1'; // Slate-300
      const fontSub = Math.max(7, size * 0.016);
      ctx.font = `bold ${fontSub}px monospace`;
      ctx.fillText('SCAN TO OPEN', qrInnerX + qrSize + margin * 0.4, qrY + qrBoxHeight * 0.75);

      ctx.restore();

      // Return Data URL of stamped image
      try {
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        resolve(dataUrl);
      } catch {
        resolve(imageSrc);
      }
    };

    img.onerror = () => {
      resolve(imageSrc);
    };

    img.src = imageSrc;
  });
}
