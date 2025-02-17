import { Relay, SimplePool } from 'nostr-tools';

const pool = new SimplePool();

export const query = (filter) => pool.querySync(['wss://relay.vertexlab.io'], filter);

export const querySocial = (filter) => pool.querySync(['wss://relay.nostr.band'], filter);