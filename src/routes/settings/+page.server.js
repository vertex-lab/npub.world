import { ranker } from '$lib/open-ranking.js';

export const actions = {
  setProvider: async ({ request }) => {
    const data = await request.formData();
    const url  = data.get('url');
    const caps = JSON.parse(data.get('caps'));
    try {
      ranker.add(url, caps);
    } catch (err) {
      return { error: err.message || err.toString() };
    }
  }
};
