import { EMBEDDED_LOGO_HORIZONTAL_BASE64, EMBEDDED_WATERMARK_BASE64 } from "./logoBase64Data";

// Official brand asset references and clean data URLs for jsPDF & HTML documents
export const LOGO_HORIZONTAL_PATH = "/marca/20-Logotipo Horizontal com fundo.png";
export const WATERMARK_PATH = "/marca/19-marca-dagua-logo-cinza-claro.png";

// Real embedded base64 data URLs for official logo and watermark
export const LOGO_HORIZONTAL_BASE64 = EMBEDDED_LOGO_HORIZONTAL_BASE64;
export const WATERMARK_BASE64 = EMBEDDED_WATERMARK_BASE64;

// In-memory cache for dynamic base64 data URLs
let cachedLogoBase64: string = EMBEDDED_LOGO_HORIZONTAL_BASE64;
let cachedWatermarkBase64: string = EMBEDDED_WATERMARK_BASE64;

if (typeof window !== "undefined") {
  (window as any).__LOGO_B64 = EMBEDDED_LOGO_HORIZONTAL_BASE64;
  (window as any).__WATERMARK_B64 = EMBEDDED_WATERMARK_BASE64;
}

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
  return cachedLogoBase64 || EMBEDDED_LOGO_HORIZONTAL_BASE64;
}

/**
 * Returns cached or freshly loaded Watermark base64
 */
export async function getWatermarkBase64(): Promise<string> {
  return cachedWatermarkBase64 || EMBEDDED_WATERMARK_BASE64;
}

