import { Relay, finalizeEvent } from 'nostr-tools';

export const relay = new Relay('wss://relay.vertexlab.io');

export const query = (filter) => {
  return new Promise((resolve, reject) => {
    const events = [];
    const sub = relay.subscribe([filter], {
      onevent(request) {
        events.push(request);
      },
      oneose() {
        resolve(events);
        sub.close();
      },
      onclose() {
        reject();
      }
    });
  });
}

/**
 * Publishes a signed request and returns the first response.
 * @param {object} request - Prepared Nostr event to send
 * @returns {Promise<object>} - First response event
 */
export async function dvm(request) {
  if (!request || typeof request !== 'object') {
    throw new Error('Invalid request object');
  }

  if (!request.kind) {
    throw new Error('Invalid request kind');
  }

  if (!request.created_at) {
    request.created_at = Math.floor(Date.now() / 1000);
  }

  if (!request.content) {
    request.content = ''; // prevents error "can't unmarshal unset fields"
  }

  request = finalizeEvent(request, process.env.SK);
  await relay.publish(request);

  let response = await query({
    kinds: [request.kind + 1000, 7000],
    '#e': [request.id],
  });

  if (!response || response.length !== 1) {
    throw new Error(`dvm: unexpected number of responses: ${response?.length || 0}`);
  }
  response = response[0]

  switch (response.kind) {
    case request.kind + 1000:
      return response

    case 7000:
      const msg = response.tags.find(t => t[0] === 'status')?.[2] || 'unknown error';
      throw new Error('dvm: ' + msg);

    default:
      throw new Error(`dvm: unexpected event kind: ${response.kind}`);}
}