/**
 * Réduction d'une image dans le navigateur avant envoi.
 *
 * Pourquoi : les photos de téléphone font plusieurs Mo, et la couche d'entrée de l'hébergeur refuse les envois
 * multipart/form-data. Les images sont donc réduites ici (environ 150 à 500 Ko) puis envoyées en JSON, sous forme de data URL.
 * Le serveur vérifie, redresse et recompresse l'image comme avant.
 */

export interface CompressOptions {
  /** Plus grand côté, en pixels */
  maxSide: number;
  /** Taille cible maximale du fichier image, en octets (avant encodage texte) */
  maxBytes: number;
  /** Logos : garde la transparence (WebP) au lieu d'aplatir sur fond blanc (JPEG) */
  keepTransparency?: boolean;
}

/** Erreur d'image à afficher telle quelle à l'utilisateur */
export class ImageCompressError extends Error { }

async function loadBitmap(file: Blob): Promise<{ source: CanvasImageSource; width: number; height: number; release: () => void }> {
  if (typeof createImageBitmap === 'function') {
    try {
      // imageOrientation : redresse les photos prises en portrait (orientation EXIF)
      const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
      return { source: bmp, width: bmp.width, height: bmp.height, release: () => bmp.close() };
    } catch {
      // repli ci-dessous (navigateur ou format non pris en charge)
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new ImageCompressError('Image illisible : utilisez une photo JPG, PNG ou WEBP.'));
      el.src = url;
    });
    return { source: img, width: img.naturalWidth, height: img.naturalHeight, release: () => URL.revokeObjectURL(url) };
  } catch (e) {
    URL.revokeObjectURL(url);
    throw e;
  }
}

/** Retourne l'image réduite sous forme de data URL (« data:image/jpeg;base64,… »). */
export async function compressImage(file: File, options: CompressOptions): Promise<string> {
  const bmp = await loadBitmap(file);
  try {
    if (!bmp.width || !bmp.height) throw new ImageCompressError('Image illisible : utilisez une photo JPG, PNG ou WEBP.');
    const mime = options.keepTransparency ? 'image/webp' : 'image/jpeg';
    let side = options.maxSide;
    let quality = 0.82;
    let dataUrl = '';

    // On réduit qualité puis dimensions jusqu'à passer sous la taille cible
    for (let attempt = 0; attempt < 6; attempt++) {
      const scale = Math.min(1, side / Math.max(bmp.width, bmp.height));
      const width = Math.max(1, Math.round(bmp.width * scale));
      const height = Math.max(1, Math.round(bmp.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new ImageCompressError("Ce navigateur ne permet pas de préparer l'image.");
      if (!options.keepTransparency) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
      }
      ctx.drawImage(bmp.source, 0, 0, width, height);
      dataUrl = canvas.toDataURL(mime, quality);
      if (dataUrl.length * 0.75 <= options.maxBytes) return dataUrl;
      quality = Math.max(0.5, quality - 0.1);
      side = Math.round(side * 0.85);
    }
    // Reste trop lourde (rare) : on l'envoie quand même si le serveur peut l'accepter (limite JSON de 3 Mo)
    if (dataUrl.length > 2_800_000) throw new ImageCompressError("L'image est trop complexe à réduire. Essayez une image plus petite.");
    return dataUrl;
  } finally {
    bmp.release();
  }
}
