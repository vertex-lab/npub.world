import { error } from '@sveltejs/kit';

import { query, dvm } from '$lib/nostr.js';
import { HEXKEY_REGEXP, NPUB_REGEXP, NIP05_REGEXP } from '$lib/string.js';
import { getPubkeys, fetchMinimalProfiles } from '$lib/profile';

export async function load({ params }) {
  return generateRandomStats(1000);
}

function generateRandomStats(days = 8) {
  function getDateLabels(days) {
    const today = new Date();
    const labels = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      
      const day = String(d.getDate()).padStart(2, '0'); // ensures 2 digits
      const month = String(d.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
      const year = d.getFullYear();
      
      labels.push(`${day} ${month} ${year}`);
    }
    
    return labels;
  }

  // helper to generate a series of numbers with some random walk
  function generatePoints(start, variance, labels) {
    let value = start;
    return labels.map(label => {
      value += Math.floor(Math.random() * variance * 2 - variance); // random walk
      if (value < 0) value = 0;
      return { x: label, y: String(value) };
    });
  }

  const labels = getDateLabels(days);

  const pubkeyStats = [
    { label: "total", points: generatePoints(350000, 3000, labels) },
    { label: "active", points: generatePoints(40000, 3000, labels) },
    { label: "posters", points: generatePoints(25000, 2000, labels) }
  ];

  const eventStats = [
    { label: "kind 0", points: generatePoints(1000, 200, labels) },
    { label: "kind 1", points: generatePoints(15000, 4000, labels) },
    { label: "kind 3", points: generatePoints(4000, 800, labels) },
    { label: "kind 6", points: generatePoints(50, 20, labels) },
    { label: "kind 7", points: generatePoints(40, 15, labels) },
    { label: "kind 69420", points: generatePoints(5000, 5000, labels) }
  ];

  return { pubkeys: pubkeyStats, events: eventStats };
}
