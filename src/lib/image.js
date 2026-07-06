import RingBuffer from "./buffer";
import sharp from 'sharp';
import { fetch } from 'undici';
import { writeFile, readFile } from 'node:fs/promises';
import { createHash } from 'crypto';

export const imagesPath = '/tmp/npub.world/pfp/'
export const lowResolution = '_100px'
export const highResolution = '_300px'
const fallbackImage = 'data:image/webp;base64,UklGRuAAAABXRUJQVlA4INQAAABwCQCdASpQAFAAPo04l0elI6IhMKiooBGJaQDScC02BEwP2H/Xw6mQ/cGOime5aeLAeko9rSLnArnPBGwjpK7fy0qQybOdlfgbKXrmiCfRhKrfmsAA/u9klMKxc9NDXPvY1gnSxBCX8RPgMave0BDaJX1ooy2y+0+NcaXhjBC7ceNEZiUnGaW3OL90AiJECb4+8XvHJlAhICa44UHriACZy4Zv6wWNf7Ww9TYj6FxPo/g6u1zzabrFBSAnSFdYxAQglMDwYG6lUgbwHi3+0na86z9AAA==';

// A ring buffer that tracks the last bad urls to avoid repeated fetching
const badURLs = new RingBuffer(20);

const isPermanentFailure = (status) => {
  return status === 404 || status === 410 || status === 400 || status === 403;
};

/**
 * Determines if a fetch Response object likely contains an image.
 * @param {Response} response - A fetch Response object.
 * @returns {boolean} - True if it looks like an image, false otherwise.
 */
function containsImage(response) {
  return response
      && typeof response === 'object'
      && 'headers' in response
      && (
          (response.headers.get('content-type') || '').startsWith('image/') ||
          (response.url && response.url.match(/\.(jpg|jpeg|png|gif|webp|avif|tiff|bmp)$/i))
      );
};

// Attempt to fetch picture by its URL and write low and high quality versions
// of the image to disk.
// Returns base64 encoded image of the specified quality.
const fetchImage = async (url, quality) => {
  if (!url || typeof url !== 'string') return fallbackImage;
  if (quality !== lowResolution && quality !== highResolution) return fallbackImage;
  if (badURLs.contains(url)) return fallbackImage;

  try {
    const response = await fetch(url, { redirect: 'follow' });
    if (response.status !== 200) {
      if (isPermanentFailure(response.status)) badURLs.add(url);
      return fallbackImage;
    }

    if (!containsImage(response)) {
      badURLs.add(url);
      return fallbackImage;
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const [ lowRes, highRes ] = await Promise.all([
      sharp(buffer).resize({ width: 100, height: 100 }).webp({ quality: 60 }).toBuffer(),
      sharp(buffer).resize({ width: 300, height: 300 }).webp({ quality: 80 }).toBuffer()
    ]);

    const hash = createHash('sha256');
    hash.update(url, 'utf8');
    const pictureHash = hash.digest('hex');

    // Write in background
    writeFile((imagesPath + pictureHash + lowResolution +'.webp'), lowRes);
    writeFile((imagesPath + pictureHash + highResolution +'.webp'), highRes);

    switch (quality) {
      case lowResolution:
        return `data:image/webp;base64,${lowRes.toString('base64')}`

      case highResolution:
        return `data:image/webp;base64,${highRes.toString('base64')}`
    }

  } catch (err) {
    badURLs.add(url);
    return fallbackImage;
  }
}

// Attempt to load from disk the picture by its url-hash and quality.
// If not found, tries to fetch by its url.
export const loadImage = async (url, quality) => {
  if (!url || typeof url !== 'string') return fallbackImage;
  if (quality !== lowResolution && quality !== highResolution) return fallbackImage;

  try {
    const hash = createHash('sha256');
    hash.update(url, 'utf8');
    const pictureHash = hash.digest('hex');
    const image = await readFile(imagesPath + pictureHash + quality +'.webp');
    return `data:image/webp;base64,${image.toString('base64')}`;

  } catch (e) {
    // Otherwise fetch and write to disk
    return await fetchImage(url, quality);
  }
}
