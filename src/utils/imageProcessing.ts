import { StudioBackgroundPreset } from '../types';

export interface ProcessImageOptions {
  preset: StudioBackgroundPreset;
  removeBackground: boolean;
  enhanceClarity: boolean;
  badgeText?: string;
  priceText?: string;
  boutiqueName?: string;
  boutiquePhone?: string;
  showWatermark?: boolean;
  bgIntensity?: number; // 0 to 1
  shadowSoftness?: number;
}

// Convert image URL or File to HTMLImageElement
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

// Smart background segmentation algorithm on Canvas
export function removeImageBackground(
  sourceCanvas: HTMLCanvasElement,
  threshold: number = 32
): HTMLCanvasElement {
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;
  const ctx = sourceCanvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return sourceCanvas;

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // Sample corner pixels to guess background color
  const samplePoints = [
    [0, 0],
    [width - 1, 0],
    [0, height - 1],
    [width - 1, height - 1],
    [Math.floor(width / 2), 0],
    [0, Math.floor(height / 2)],
    [width - 1, Math.floor(height / 2)],
  ];

  let totalR = 0, totalG = 0, totalB = 0;
  samplePoints.forEach(([x, y]) => {
    const idx = (y * width + x) * 4;
    totalR += data[idx];
    totalG += data[idx + 1];
    totalB += data[idx + 2];
  });
  const bgR = totalR / samplePoints.length;
  const bgG = totalG / samplePoints.length;
  const bgB = totalB / samplePoints.length;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const colorDist = Math.sqrt(
      (r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2
    );

    // If pixel is very close to sample background or near pure white/light gray
    const isLightBg = r > 235 && g > 235 && b > 235;
    const isDarkBg = r < 25 && g < 25 && b < 25 && (bgR < 40 && bgG < 40 && bgB < 40);

    if (colorDist < threshold || isLightBg || isDarkBg) {
      // Soft alpha feathering
      const alphaFactor = Math.max(0, Math.min(1, (colorDist - threshold * 0.5) / (threshold * 0.5)));
      data[i + 3] = Math.round(data[i + 3] * alphaFactor);
    }
  }

  const outCanvas = document.createElement('canvas');
  outCanvas.width = width;
  outCanvas.height = height;
  const outCtx = outCanvas.getContext('2d');
  if (outCtx) {
    outCtx.putImageData(imgData, 0, 0);
  }
  return outCanvas;
}

// Enhance clarity, contrast and saturation (AI Upscale simulation)
export function applyClarityEnhancement(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // S-Curve contrast and slight saturation boost
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Contrast adjustment
    r = 128 + (r - 128) * 1.14;
    g = 128 + (g - 128) * 1.14;
    b = 128 + (b - 128) * 1.14;

    // Vibrancy / Saturation boost
    const avg = (r + g + b) / 3;
    r = avg + (r - avg) * 1.18;
    g = avg + (g - avg) * 1.18;
    b = avg + (b - avg) * 1.18;

    data[i] = Math.max(0, Math.min(255, r));
    data[i + 1] = Math.max(0, Math.min(255, g));
    data[i + 2] = Math.max(0, Math.min(255, b));
  }

  ctx.putImageData(imgData, 0, 0);
}

// Draw thematic background based on preset
function drawBackgroundScene(
  ctx: CanvasRenderingContext2D,
  preset: StudioBackgroundPreset,
  width: number,
  height: number
) {
  ctx.save();

  if (preset.id === 'luxe_marble_gold') {
    // Marble gradient
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#fbfbfb');
    grad.addColorStop(0.5, '#eef0f4');
    grad.addColorStop(1, '#dfe3eb');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Marble veins
    ctx.strokeStyle = 'rgba(217, 119, 6, 0.15)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, height * 0.2);
    ctx.bezierCurveTo(width * 0.3, height * 0.15, width * 0.6, height * 0.35, width, height * 0.1);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(160, 174, 192, 0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, height * 0.7);
    ctx.bezierCurveTo(width * 0.4, height * 0.8, width * 0.7, height * 0.6, width, height * 0.75);
    ctx.stroke();

    // Studio floor reflection divider
    const floorGrad = ctx.createLinearGradient(0, height * 0.7, 0, height);
    floorGrad.addColorStop(0, 'rgba(255,255,255,0.4)');
    floorGrad.addColorStop(1, 'rgba(210,215,225,0.8)');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, height * 0.7, width, height * 0.3);
  } else if (preset.id === 'neon_cyber_podium') {
    // Deep dark backdrop
    const grad = ctx.createRadialGradient(
      width * 0.5,
      height * 0.4,
      50,
      width * 0.5,
      height * 0.5,
      width * 0.8
    );
    grad.addColorStop(0, '#312e81');
    grad.addColorStop(0.5, '#1e1b4b');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Glowing Neon Podium Cylinder at base
    const podiumX = width * 0.5;
    const podiumY = height * 0.78;
    const podiumW = width * 0.72;
    const podiumH = 40;

    // Ambient glow
    ctx.shadowColor = '#818CF8';
    ctx.shadowBlur = 45;

    // Podium ellipse
    ctx.fillStyle = '#4338ca';
    ctx.beginPath();
    ctx.ellipse(podiumX, podiumY, podiumW / 2, podiumH / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Top rim highlight
    ctx.strokeStyle = '#c7d2fe';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.shadowBlur = 0;
  } else if (preset.id === 'rose_velvet_glam') {
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#fff1f2');
    grad.addColorStop(0.5, '#fce7f3');
    grad.addColorStop(1, '#fbcfe8');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Bokeh ambient bubbles
    const bubbles = [
      { x: width * 0.2, y: height * 0.2, r: 80 },
      { x: width * 0.8, y: height * 0.3, r: 110 },
      { x: width * 0.15, y: height * 0.8, r: 90 },
      { x: width * 0.85, y: height * 0.85, r: 70 },
    ];
    bubbles.forEach((b) => {
      const bGrad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
      bGrad.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
      bGrad.addColorStop(1, 'rgba(251, 207, 232, 0)');
      ctx.fillStyle = bGrad;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
    });
  } else if (preset.id === 'botanical_zen') {
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#f0fdf4');
    grad.addColorStop(0.6, '#dcfce7');
    grad.addColorStop(1, '#bbf7d0');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Organic shadow motifs
    ctx.fillStyle = 'rgba(5, 150, 105, 0.08)';
    ctx.beginPath();
    ctx.ellipse(width * 0.15, height * 0.25, 100, 180, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(width * 0.85, height * 0.2, 120, 200, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
  } else if (preset.id === 'warm_sunset_terrace') {
    const grad = ctx.createRadialGradient(
      width * 0.7,
      height * 0.2,
      20,
      width * 0.5,
      height * 0.5,
      width
    );
    grad.addColorStop(0, '#fffbeb');
    grad.addColorStop(0.4, '#fef3c7');
    grad.addColorStop(0.8, '#fed7aa');
    grad.addColorStop(1, '#fdba74');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else if (preset.id === 'scandi_wood_loft') {
    // Warm neutral wall
    const wallGrad = ctx.createLinearGradient(0, 0, 0, height * 0.7);
    wallGrad.addColorStop(0, '#fafaf9');
    wallGrad.addColorStop(1, '#f5f5f4');
    ctx.fillStyle = wallGrad;
    ctx.fillRect(0, 0, width, height * 0.7);

    // Wood floor
    const woodGrad = ctx.createLinearGradient(0, height * 0.7, 0, height);
    woodGrad.addColorStop(0, '#d97706');
    woodGrad.addColorStop(1, '#b45309');
    ctx.fillStyle = woodGrad;
    ctx.fillRect(0, height * 0.7, width, height * 0.3);

    // Subtle wood planks lines
    ctx.strokeStyle = 'rgba(120, 53, 15, 0.3)';
    ctx.lineWidth = 1.5;
    for (let x = 0; x <= width; x += width / 5) {
      ctx.beginPath();
      ctx.moveTo(x, height * 0.7);
      ctx.lineTo(x + (x - width / 2) * 0.4, height);
      ctx.stroke();
    }
  } else {
    // Minimal Clean Studio
    const grad = ctx.createRadialGradient(
      width * 0.5,
      height * 0.45,
      50,
      width * 0.5,
      height * 0.5,
      width * 0.85
    );
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.7, '#f8fafc');
    grad.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }

  ctx.restore();
}

// Render complete studio image with shadows and branding badges
export async function renderStudioImage(
  imageSource: HTMLImageElement | string,
  options: ProcessImageOptions,
  targetWidth: number = 1080,
  targetHeight: number = 1080
): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not obtain canvas context');

  // Load raw image
  const rawImg = typeof imageSource === 'string' ? await loadImage(imageSource) : imageSource;

  // 1. Draw Background
  drawBackgroundScene(ctx, options.preset, targetWidth, targetHeight);

  // 2. Prepare Product Image (with optional background removal)
  let productCanvas: HTMLCanvasElement | HTMLImageElement = rawImg;
  if (options.removeBackground) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = rawImg.naturalWidth || rawImg.width;
    tempCanvas.height = rawImg.naturalHeight || rawImg.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx) {
      tempCtx.drawImage(rawImg, 0, 0);
      productCanvas = removeImageBackground(tempCanvas, 36);
    }
  }

  // 3. Compute optimal scale and positioning (centered, slightly elevated)
  const productWidth = productCanvas.width;
  const productHeight = productCanvas.height;
  const maxRenderW = targetWidth * 0.76;
  const maxRenderH = targetHeight * 0.72;
  const scale = Math.min(maxRenderW / productWidth, maxRenderH / productHeight);

  const drawW = productWidth * scale;
  const drawH = productHeight * scale;
  const drawX = (targetWidth - drawW) / 2;
  const drawY = (targetHeight - drawH) / 2 - 20;

  // 4. Realistic Drop Shadow under the product
  ctx.save();
  const shadowY = drawY + drawH - 10;
  const shadowGrad = ctx.createRadialGradient(
    targetWidth / 2,
    shadowY,
    10,
    targetWidth / 2,
    shadowY,
    drawW * 0.45
  );
  shadowGrad.addColorStop(0, 'rgba(15, 23, 42, 0.45)');
  shadowGrad.addColorStop(0.5, 'rgba(15, 23, 42, 0.18)');
  shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(targetWidth / 2, shadowY, drawW * 0.45, 24, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 5. Draw Product Image
  ctx.drawImage(productCanvas, drawX, drawY, drawW, drawH);

  // 6. Apply Clarity / Sharpness Filter if requested
  if (options.enhanceClarity) {
    applyClarityEnhancement(ctx, targetWidth, targetHeight);
  }

  // 7. Branding & Badges
  // A. Top Promo Badge (e.g., "PROMO FLASH", "NOUVELLE COLLECTION")
  if (options.badgeText) {
    ctx.save();
    const badgeText = options.badgeText.toUpperCase();
    ctx.font = 'bold 26px sans-serif';
    const textWidth = ctx.measureText(badgeText).width;
    const badgePadX = 24;
    const badgePadY = 12;
    const badgeW = textWidth + badgePadX * 2;
    const badgeH = 46;
    const badgeX = 36;
    const badgeY = 36;

    // Badge Pill Background
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = options.preset.accentColor || '#D97706';
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 23);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Badge Text
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillText(badgeText, badgeX + badgeW / 2, badgeY + badgeH / 2);
    ctx.restore();
  }

  // B. Price Badge (Top Right)
  if (options.priceText) {
    ctx.save();
    const priceStr = options.priceText;
    ctx.font = '900 32px sans-serif';
    const priceWidth = ctx.measureText(priceStr).width;
    const pW = priceWidth + 48;
    const pH = 56;
    const pX = targetWidth - pW - 36;
    const pY = 36;

    // Gold / Dark luxury container
    ctx.shadowColor = 'rgba(0,0,0,0.25)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 6;
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(pX, pY, pW, pH, 28);
    ctx.fill();

    // Golden border
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Price Text
    ctx.fillStyle = '#FBBF24';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillText(priceStr, pX + pW / 2, pY + pH / 2);
    ctx.restore();
  }

  // C. Bottom Boutique & WhatsApp Badge
  ctx.save();
  const bottomH = 76;
  const bottomY = targetHeight - bottomH - 32;
  const bottomX = 36;
  const bottomW = targetWidth - 72;

  // Frosted White / Glass pill bar
  ctx.shadowColor = 'rgba(0,0,0,0.15)';
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.beginPath();
  ctx.roundRect(bottomX, bottomY, bottomW, bottomH, 24);
  ctx.fill();

  // Border
  ctx.strokeStyle = 'rgba(226, 232, 240, 0.8)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Boutique Name on left
  const bName = options.boutiqueName || 'Ma Boutique';
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 24px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(bName, bottomX + 24, bottomY + bottomH / 2);

  // WhatsApp Order Badge on right
  const bPhone = options.boutiquePhone ? `WhatsApp : ${options.boutiquePhone}` : '💬 Commandes en DM';
  ctx.fillStyle = '#059669'; // Green WhatsApp
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText(bPhone, bottomX + bottomW - 24, bottomY + bottomH / 2);

  ctx.restore();

  // D. Subtle Watermark (only for free tier)
  if (options.showWatermark) {
    ctx.save();
    ctx.font = '500 16px sans-serif';
    ctx.fillStyle = 'rgba(100, 116, 139, 0.6)';
    ctx.textAlign = 'center';
    ctx.fillText('✨ Créé avec VendeusePro AI', targetWidth / 2, targetHeight - 12);
    ctx.restore();
  }

  return canvas.toDataURL('image/jpeg', 0.92);
}
