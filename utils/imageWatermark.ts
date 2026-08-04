'use client';

/**
 * Utility to permanently bake the "سوق البالات" diagonal watermark stamp
 * and QR code directly into the image canvas pixels without black letterbox borders.
 * Stretches/fills the square image completely so the watermark is directly over the photo.
 */
export async function createStampedImage(
  imageSrc: string,
  options: {
    stampText?: string;
    subText?: string;
    opacity?: number;
  } = {}
): Promise<string> {
  const {
    stampText = 'سوق البالات',
    subText = 'AMAZON & DHL OUTLET IQ 🇮🇶',
    opacity = 0.38,
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

      // Force 1:1 Square aspect ratio without black borders (center crop fill)
      const size = Math.max(img.width, img.height);
      canvas.width = size;
      canvas.height = size;

      // Draw image stretched to cover canvas perfectly (no letterboxing / no black bars)
      let srcX = 0;
      let srcY = 0;
      let srcWidth = img.width;
      let srcHeight = img.height;

      if (img.width > img.height) {
        srcWidth = img.height;
        srcX = (img.width - img.height) / 2;
      } else if (img.height > img.width) {
        srcHeight = img.width;
        srcY = (img.height - img.width) / 2;
      }

      ctx.drawImage(img, srcX, srcY, srcWidth, srcHeight, 0, 0, size, size);

      // ─── 1. Diagonal Watermark Stamp over the image ─────────────────
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.translate(size / 2, size / 2);
      ctx.rotate((-25 * Math.PI) / 180);

      const boxWidth = size * 0.58;
      const boxHeight = size * 0.20;

      // Stamp Outer Box
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = Math.max(4, size * 0.009);
      ctx.strokeRect(-boxWidth / 2, -boxHeight / 2, boxWidth, boxHeight);

      // Inner text (Gold/White)
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const fontSize = Math.max(18, size * 0.058);
      ctx.font = `900 ${fontSize}px sans-serif, Cairo, Tahoma`;
      ctx.fillText(stampText, 0, -boxHeight * 0.15);

      const subFontSize = Math.max(10, size * 0.026);
      ctx.font = `bold ${subFontSize}px sans-serif, monospace`;
      ctx.fillStyle = '#F59E0B'; // Amber
      ctx.fillText(subText, 0, boxHeight * 0.22);

      ctx.restore();

      // ─── 2. Bottom-Left QR & Branding Stamp directly inside photo ─────
      ctx.save();
      ctx.globalAlpha = 0.88;
      const qrBoxWidth = size * 0.34;
      const qrBoxHeight = size * 0.12;
      const margin = size * 0.035;
      const qrX = margin;
      const qrY = size - qrBoxHeight - margin;

      // Dark background rounded tag directly on photo
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.roundRect(qrX, qrY, qrBoxWidth, qrBoxHeight, Math.max(6, size * 0.015));
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = Math.max(1.5, size * 0.003);
      ctx.stroke();

      // White box for QR representation
      const qrSize = qrBoxHeight * 0.75;
      const qrInnerX = qrX + margin * 0.4;
      const qrInnerY = qrY + (qrBoxHeight - qrSize) / 2;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(qrInnerX, qrInnerY, qrSize, qrSize);

      // Inner QR patterns
      ctx.fillStyle = '#000000';
      const pSize = qrSize / 5;
      ctx.fillRect(qrInnerX + pSize, qrInnerY + pSize, pSize * 3, pSize * 3);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(qrInnerX + pSize * 2, qrInnerY + pSize * 2, pSize, pSize);

      // Branding text beside QR
      ctx.fillStyle = '#F59E0B';
      const fontBranding = Math.max(10, size * 0.024);
      ctx.font = `900 ${fontBranding}px sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText('سوق البالات', qrInnerX + qrSize + margin * 0.35, qrY + qrBoxHeight * 0.42);

      ctx.fillStyle = '#E2E8F0';
      const fontSub = Math.max(8, size * 0.017);
      ctx.font = `bold ${fontSub}px monospace`;
      ctx.fillText('SCAN TO OPEN', qrInnerX + qrSize + margin * 0.35, qrY + qrBoxHeight * 0.78);

      ctx.restore();

      try {
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
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
