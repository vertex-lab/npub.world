
import { relay } from './lib/relay';

export async function init() {
  await relay.connect();
  console.log('Relay connected');
}

// Handle requests
export const handle = async ({ event, resolve }) => {
  const response = await resolve(event);
  return response;
};