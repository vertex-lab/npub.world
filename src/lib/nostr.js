import { Relay, finalizeEvent } from 'nostr-tools';
import * as nip19 from 'nostr-tools/nip19';

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
 * Parses the content of a kind:0 profile event into a structured object.
 * Returns null if the event is missing or its content is invalid JSON.
 * @param {object} event - A kind:0 Nostr event
 * @returns {{ name: string, pictureURL: string, about: string, nip05: string, lud16: string, website: string } | null}
 */
export function parseProfile(event) {
  if (!event) return null;
  try {
    const c = JSON.parse(event.content);
    return {
      npub:       nip19.npubEncode(event.pubkey),
      name:       c.display_name || c.displayName || c.name,
      pictureURL: c.picture,
      about:      c.about,
      nip05:      c.nip05?.toString().toLowerCase(),
      lud16:      c.lud16,
      website:    c.website,
    };
  } catch {
    return null;
  }
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

  request = finalizeEvent(request, process.env.SECRET_KEY);
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
