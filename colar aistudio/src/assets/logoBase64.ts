// Official brand asset references and clean data URLs for jsPDF & HTML documents
export const LOGO_HORIZONTAL_PATH = "/marca/20-Logotipo Horizontal com fundo.png";
export const WATERMARK_PATH = "/marca/19-marca-dagua-logo-cinza-claro.png";

// In-memory cache for dynamic base64 data URLs
let cachedLogoBase64: string | null = null;
let cachedWatermarkBase64: string | null = null;

// Clean standard fallback PNG data URL (1x1 transparent PNG) to prevent any render crash
export const LOGO_HORIZONTAL_BASE64 = 
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

export const WATERMARK_BASE64 = 
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

/**
 * Loads an image from a URL or public path and converts it to a base64 Data URL for jsPDF.
 */
export async function loadImageAsBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = () => resolve(LOGO_HORIZONTAL_BASE64);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn(`Failed to load base64 for image: ${url}`, error);
    return LOGO_HORIZONTAL_BASE64;
  }
}

/**
 * Returns cached or freshly loaded Logo Horizontal base64
 */
export async function getLogoHorizontalBase64(): Promise<string> {
  if (!cachedLogoBase64) {
    cachedLogoBase64 = await loadImageAsBase64(LOGO_HORIZONTAL_PATH);
    if (typeof window !== "undefined") {
      (window as any).__LOGO_B64 = cachedLogoBase64;
    }
  }
  return cachedLogoBase64;
}

/**
 * Returns cached or freshly loaded Watermark base64
 */
export async function getWatermarkBase64(): Promise<string> {
  if (!cachedWatermarkBase64) {
    cachedWatermarkBase64 = await loadImageAsBase64(WATERMARK_PATH);
    if (typeof window !== "undefined") {
      (window as any).__WATERMARK_B64 = cachedWatermarkBase64;
    }
  }
  return cachedWatermarkBase64;
}

// Pre-load in browser background if window is defined
if (typeof window !== "undefined") {
  getLogoHorizontalBase64().catch(() => {});
  getWatermarkBase64().catch(() => {});
}

