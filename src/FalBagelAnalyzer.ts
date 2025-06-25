// FalBagelAnalyzer.ts
// Production-ready Fal AI Bagel model integration for selfie hair/skin analysis
// See README in this file for usage, privacy, and ethical guidelines

import { createFalClient } from '@fal-ai/client';

export type AnalysisMode = 'comprehensive' | 'hair' | 'skin' | 'quick' | 'custom';
export type ImageInput = File | Blob | string; // File/Blob or base64 data URL
// export FAL_KEY="45315040-51d5-43bc-bdb9-dc58801e66f2:9724cb8e915be00426974a7ef9b2704a";

export interface FalBagelAnalyzerOptions {
  apiKey?: string;
  cacheResponses?: boolean;
  progressCallback?: (progress: number) => void;
}

export interface AnalysisResult {
  hair?: Record<string, any>;
  skin?: Record<string, any>;
  recommendations?: string[];
  features?: string[]; // Key features as short phrases, e.g., ["Curly hair", "Oily Skin"]
  raw?: any;
}

export interface AnalyzeParams {
  image: ImageInput;
  mode?: AnalysisMode;
  customPrompt?: string;
}

/**
 * FalBagelAnalyzer: Analyze selfie images for hair and skin characteristics using Fal AI Bagel model.
 *
 * Ethical/Privacy: Always obtain user consent before uploading images. Do not store images or results longer than necessary. Inform users of AI limitations and possible biases.
 */
export class FalBagelAnalyzer {
  private client: ReturnType<typeof createFalClient>;
  private cache: Map<string, AnalysisResult> = new Map();
  private cacheEnabled: boolean;
  private progressCallback?: (progress: number) => void;

  constructor(options: FalBagelAnalyzerOptions = {}) {
    const apiKey = options.apiKey || process.env.FAL_KEY;
    if (!apiKey) throw new Error('FAL_KEY is required for FalBagelAnalyzer');
    this.client = createFalClient({ credentials: apiKey });
    this.cacheEnabled = !!options.cacheResponses;
    this.progressCallback = options.progressCallback;
  }

  /**
   * Analyze a selfie image for hair/skin characteristics.
   * @param params AnalyzeParams
   * @returns AnalysisResult
   */
  async analyze(params: AnalyzeParams): Promise<AnalysisResult> {
    const { image, customPrompt } = params;
    // Validate image
    const { url, cacheKey } = await this.handleImageInput(image);
    if (this.cacheEnabled && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }
    // Compose prompt
    const prompt = customPrompt || this.composePrompt();
    // Progress: uploading
    this.progressCallback?.(0.2);
    // Call Fal AI Bagel model
    let response;
    try {
      response = await this.client.run('fal-ai/bagel/understand', {
        input: { image_url: url, prompt },
      });
    } catch (err: any) {
      throw new Error(`Fal AI request failed: ${err?.message || err}`);
    }
    this.progressCallback?.(0.7);
    // Validate/parse response
    const result = this.parseResponse(response);
    if (this.cacheEnabled) this.cache.set(cacheKey, result);
    this.progressCallback?.(1);
    return result;
  }

  /**
   * Handle image input (File/Blob or base64 string). Returns { url, cacheKey }.
   */
  private async handleImageInput(image: ImageInput): Promise<{ url: string; cacheKey: string }> {
    let url: string;
    let cacheKey: string;
    if (typeof image === 'string') {
      // base64 data URL
      if (!/^data:image\/(jpeg|jpg|png|webp|gif|avif);base64,/.test(image)) {
        throw new Error('Invalid image data URL format.');
      }
      url = image;
      cacheKey = image.slice(0, 100); // Use first 100 chars as cache key
    } else if (image instanceof File || image instanceof Blob) {
      // Validate file type/size
      const validTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/avif',
      ];
      if (!validTypes.includes((image as File).type)) {
        throw new Error('Unsupported image format. Allowed: JPG, JPEG, PNG, WebP, GIF, AVIF.');
      }
      if ((image as File).size > 5 * 1024 * 1024) {
        throw new Error('Image file too large (max 5MB).');
      }
      // Upload to Fal storage
      try {
        url = await this.client.storage.upload(image);
        cacheKey = url;
      } catch (err: any) {
        throw new Error('Image upload failed: ' + (err?.message || err));
      }
    } else {
      throw new Error('Invalid image input type.');
    }
    return { url, cacheKey };
  }

  /**
   * Compose a detailed prompt for the Bagel model based on analysis mode.
   */
  private composePrompt(): string {
    return `I want you to examine the person in this picture and analyze their hair's features like, length, colour, health and tone. Then, Once you have done that I want you to describe it using only 3-4 short descriptions such as: "Curly Hair", "Oily Skin", etc. ONLY RETURN THE 3-4 SHORT DESCRIPTIONS SEPERATED BY A COMMA`;
  }

  /**
   * Parse and format the Bagel model response.
   */
  private parseResponse(response: any): AnalysisResult {
    // The Bagel model may return a string or structured object
    let text = response?.text || response?.result || response;
    if (typeof text !== 'string') text = JSON.stringify(text);
    // Attempt to extract sections for hair/skin/recommendations/features
    const result: AnalysisResult = { raw: response };
    // Extract features: look for a comma-separated or bulleted list at the top
    let features: string[] = [];
    // 1. Try to match a comma-separated list at the top
    const commaListMatch = text.match(/^(?:Key Features:)?\s*(["'\w\s\-]+(?:,\s*["'\w\s\-]+)+)/im);
    if (commaListMatch) {
      features = commaListMatch[1].split(',').map((f: string) => f.replace(/^["'\s-]+|["'\s-]+$/g, '')).filter(Boolean);
    } else {
      // 2. Try to match a bulleted list at the top
      const bulletListMatch = text.match(/^(?:Key Features:)?[\s\n\r-]*((?:-\s*["'\w\s]+\n?)+)/im);
      if (bulletListMatch) {
        features = bulletListMatch[1].split(/\n|-/).map((f: string) => f.trim()).filter((f: string) => f.length > 0);
      }
    }
    if (features.length > 0) result.features = features;
    // Simple section parsing (could be improved with NLP)
    const hairMatch = text.match(/Hair Analysis:(.*?)(Skin Analysis:|Guidelines:|$)/is);
    const skinMatch = text.match(/Skin Analysis:(.*?)(Guidelines:|$)/is);
    const recMatch = text.match(/recommendations?:([\s\S]*)/i);
    if (hairMatch) result.hair = { summary: hairMatch[1].trim() };
    if (skinMatch) result.skin = { summary: skinMatch[1].trim() };
    if (recMatch) result.recommendations = recMatch[1].split(/\n|\./).map((s: string) => s.trim()).filter((s: string) => Boolean(s));
    return result;
  }

  /**
   * Clear the response cache.
   */
  clearCache() {
    this.cache.clear();
  }
}

/**
 * Example usage:
 *
 * import { FalBagelAnalyzer } from './FalBagelAnalyzer';
 *
 * const analyzer = new FalBagelAnalyzer({ apiKey: 'YOUR_FAL_KEY' });
 * const file = ... // File or base64 string
 * analyzer.analyze({ image: file, mode: 'comprehensive' })
 *   .then(result => console.log(result))
 *   .catch(err => alert(err.message));
 *
 * // Ethical/Privacy: Always get user consent before uploading images. Do not store images/results longer than needed.
 */ 