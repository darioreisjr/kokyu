export interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.crossOrigin = 'anonymous';
    image.src = url;
  });
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/** The bounding box a `width`×`height` rectangle occupies once rotated by `rotation` degrees. */
function rotatedRectSize(width: number, height: number, rotation: number) {
  const rotRad = toRadians(rotation);
  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

/**
 * Renders the cropped, rotated region of `imageSrc` onto a canvas and
 * returns it as a Blob — the standard react-easy-crop recipe: rotate
 * the full source image around its own center first (into a canvas
 * sized to the rotated bounding box, so nothing clips), then extract
 * just the cropped rectangle `react-easy-crop` reported.
 *
 * Not unit-tested beyond a smoke test — this exercises the Canvas 2D
 * API, not `react-easy-crop` itself (its own crop-area math is the
 * library's responsibility, not ours to re-verify).
 */
export async function getCroppedImageBlob(
  imageSrc: string,
  pixelCrop: PixelCrop,
  rotation = 0,
  mimeType = 'image/jpeg',
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const rotRad = toRadians(rotation);
  const { width: boxWidth, height: boxHeight } = rotatedRectSize(
    image.width,
    image.height,
    rotation,
  );

  const rotatedCanvas = document.createElement('canvas');
  const rotatedCtx = rotatedCanvas.getContext('2d');
  if (!rotatedCtx) throw new Error('Canvas 2D context is unavailable');

  rotatedCanvas.width = boxWidth;
  rotatedCanvas.height = boxHeight;

  rotatedCtx.translate(boxWidth / 2, boxHeight / 2);
  rotatedCtx.rotate(rotRad);
  rotatedCtx.translate(-image.width / 2, -image.height / 2);
  rotatedCtx.drawImage(image, 0, 0);

  const croppedCanvas = document.createElement('canvas');
  const croppedCtx = croppedCanvas.getContext('2d');
  if (!croppedCtx) throw new Error('Canvas 2D context is unavailable');

  croppedCanvas.width = pixelCrop.width;
  croppedCanvas.height = pixelCrop.height;

  croppedCtx.drawImage(
    rotatedCanvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  return new Promise((resolve, reject) => {
    croppedCanvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to create the cropped image'));
    }, mimeType);
  });
}
