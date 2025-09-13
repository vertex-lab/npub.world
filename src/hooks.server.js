import { relay } from './lib/nostr.js';
import { imagesPath } from './lib/profile.js'
import { mkdir } from 'node:fs/promises';

const initializeServices = async () => {
  try {
    await relay.connect();
    console.log('Relay connected');

    await mkdir(imagesPath, { recursive: true });
    console.log('Ensured directory %s exists', imagesPath);

  } catch (error) {
    console.error('Error initializing services:', error);
    process.exit(1);
  }
};

initializeServices();

// Handle requests
export const handle = async ({ event, resolve }) => {
  const response = await resolve(event);
  return response;
};

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM');
  // Close any open connections or clean up resources here
  await relay.close();
  process.exit(0);
});