import { Relay } from 'nostr-tools';

export const relay = new Relay('wss://relay.vertexlab.io');

export const query = (filter) => {
  return new Promise((resolve, reject) => {
    const events = [];
    const sub = relay.subscribe([filter], {
      onevent(event) {
        events.push(event);
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