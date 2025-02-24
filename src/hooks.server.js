
import { relay } from './lib/relay';

const initializeServices = async () => {
  try {
    await relay.connect();
    console.log('Relay connected');
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