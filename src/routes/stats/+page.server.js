import { error } from '@sveltejs/kit';

import { query, dvm } from '$lib/nostr.js';
import { HEXKEY_REGEXP, NPUB_REGEXP, NIP05_REGEXP } from '$lib/string.js';
import { getPubkeys, fetchMinimalProfiles } from '$lib/profile';

export async function load({ params }) {
  const pubkeyStats = [
    {
      label: "total",
      points: [
        { x: "17 Sep", y: "370562" },
        { x: "18 Sep", y: "372100" },
        { x: "19 Sep", y: "374000" },
        { x: "20 Sep", y: "375800" },
        { x: "21 Sep", y: "377000" },
        { x: "22 Sep", y: "378500" },
        { x: "23 Sep", y: "379800" },
        { x: "24 Sep", y: "380562" }
      ]
    },
    {
      label: "active",
      points: [
        { x: "17 Sep", y: "40000" },
        { x: "18 Sep", y: "42000" },
        { x: "19 Sep", y: "46000" },
        { x: "20 Sep", y: "50000" },
        { x: "21 Sep", y: "58000" },
        { x: "22 Sep", y: "62000" },
        { x: "23 Sep", y: "67000" },
        { x: "24 Sep", y: "69000" }
      ]
    },
    {
      label: "posters",
      points: [
        { x: "17 Sep", y: "27000" },
        { x: "18 Sep", y: "28000" },
        { x: "19 Sep", y: "28500" },
        { x: "20 Sep", y: "29000" },
        { x: "21 Sep", y: "31000" },
        { x: "22 Sep", y: "32000" },
        { x: "23 Sep", y: "34000" },
        { x: "24 Sep", y: "35000" }
      ]
    }
  ];
  
  
  const eventStats = [
    {
      label: "kind 0",
      points: [
        { x: "17 Sep", y: "1000" },
        { x: "18 Sep", y: "1100" },
        { x: "19 Sep", y: "1150" },
        { x: "20 Sep", y: "1200" },
        { x: "21 Sep", y: "1320" },
        { x: "22 Sep", y: "1400" },
        { x: "23 Sep", y: "1500" },
        { x: "24 Sep", y: "1532" }
      ]
    },
    {
      label: "kind 1",
      points: [
        { x: "17 Sep", y: "15000" },
        { x: "18 Sep", y: "18500" },
        { x: "19 Sep", y: "20000" },
        { x: "20 Sep", y: "23900" },
        { x: "21 Sep", y: "21000" },
        { x: "22 Sep", y: "17500" },
        { x: "23 Sep", y: "14500" },
        { x: "24 Sep", y: "13870" }
      ]
    },
    {
      label: "kind 3",
      points: [
        { x: "17 Sep", y: "4000" },
        { x: "18 Sep", y: "4200" },
        { x: "19 Sep", y: "4500" },
        { x: "20 Sep", y: "4789" },
        { x: "21 Sep", y: "4400" },
        { x: "22 Sep", y: "4100" },
        { x: "23 Sep", y: "3900" },
        { x: "24 Sep", y: "3872" }
      ]
    },
    {
      label: "kind 6",
      points: [
        { x: "17 Sep", y: "55" },
        { x: "18 Sep", y: "52" },
        { x: "19 Sep", y: "49" },
        { x: "20 Sep", y: "49" },
        { x: "21 Sep", y: "60" },
        { x: "22 Sep", y: "70" },
        { x: "23 Sep", y: "90" },
        { x: "24 Sep", y: "111" }
      ]
    },
    {
      label: "kind 7",
      points: [
        { x: "17 Sep", y: "45" },
        { x: "18 Sep", y: "40" },
        { x: "19 Sep", y: "38" },
        { x: "20 Sep", y: "37" },
        { x: "21 Sep", y: "20" },
        { x: "22 Sep", y: "10" },
        { x: "23 Sep", y: "5" },
        { x: "24 Sep", y: "1" }
      ]
    },
    {
      label: "kind 69420",
      points: [
        { x: "17 Sep", y: "5543" },
        { x: "18 Sep", y: "5443" },
        { x: "19 Sep", y: "4549" },
        { x: "20 Sep", y: "4549" },
        { x: "21 Sep", y: "6450" },
        { x: "22 Sep", y: "7430" },
        { x: "23 Sep", y: "9440" },
        { x: "24 Sep", y: "21031" }
      ]
    },
  ];

  return {pubkeys: pubkeyStats, events: eventStats}
}
