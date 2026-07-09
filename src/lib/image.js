import { LRUCache } from 'lru-cache';
import sharp from 'sharp';
import { fetch } from 'undici';
import { writeFile, readFile, mkdir } from 'node:fs/promises';
import { createHash } from 'crypto';

export const imagesPath = '/tmp/npub.world/pfp/'
export const lowResolution = '_100px'
export const highResolution = '_300px'


const isPermanentFailure = (status) => {
  return status === 400 || status === 403 || status === 404 || status === 410;
};

function containsImage(response) {
  return response
    && typeof response === 'object'
    && 'headers' in response
    && (
      (response.headers.get('content-type') || '').startsWith('image/') ||
      (response.url && response.url.match(/\.(jpg|jpeg|png|gif|webp|avif|tiff|bmp)$/i))
    );
}

/**
 * Handles fetching profile images from URLs, caching good images to disk
 * and tracking bad URLs in memory to avoid repeated failed requests.
 */
class Imager {
  constructor() {
    // Tracks URLs that recently failed, to avoid repeated fetching
    this.badURLs = new LRUCache({ max: 10_000, ttl: 1000 * 60 * 10 });
  }

  async init() {
    await mkdir(imagesPath, { recursive: true });
    console.log("Ensured directory %s exists", imagesPath);
  }

  async load(url, quality) {
    if (!url || typeof url !== 'string') return null;
    if (quality !== lowResolution && quality !== highResolution) return null;

    try {
      const hash = createHash('sha256');
      hash.update(url, 'utf8');
      const pictureHash = hash.digest('hex');
      const image = await readFile(imagesPath + pictureHash + quality + '.webp');
      return `data:image/webp;base64,${image.toString('base64')}`;
    } catch {
      return this.#fetch(url, quality);
    }
  }

  async #fetch(url, quality) {
    if (!url || typeof url !== 'string') return null;
    if (quality !== lowResolution && quality !== highResolution) return null;
    if (this.badURLs.has(url)) return null;

    try {
      const response = await fetch(url, { redirect: 'follow' });
      if (response.status !== 200) {
        if (isPermanentFailure(response.status)) this.badURLs.set(url, true);
        return null;
      }

      if (!containsImage(response)) {
        this.badURLs.set(url, true);
        return null;
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const [lowRes, highRes] = await Promise.all([
        sharp(buffer).resize({ width: 100, height: 100 }).webp({ quality: 60 }).toBuffer(),
        sharp(buffer).resize({ width: 300, height: 300 }).webp({ quality: 80 }).toBuffer()
      ]);

      const hash = createHash('sha256');
      hash.update(url, 'utf8');
      const pictureHash = hash.digest('hex');

      // Write both resolutions in background
      writeFile(imagesPath + pictureHash + lowResolution + '.webp', lowRes);
      writeFile(imagesPath + pictureHash + highResolution + '.webp', highRes);

      switch (quality) {
        case lowResolution:  return `data:image/webp;base64,${lowRes.toString('base64')}`;
        case highResolution: return `data:image/webp;base64,${highRes.toString('base64')}`;
      }

    } catch {
      this.badURLs.set(url, true);
      return null;
    }
  }

}

export const imager = new Imager();
