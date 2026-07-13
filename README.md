# npub.world

A Nostr profile search engine, viewer, and discovery app.

## What is npub.world?

**npub.world** is a web application for searching, viewing, and discovering Nostr profiles. It lets you search for Nostr users by name, public key, or NIP-05 identifier, view detailed profile information including reputation and top followers, and discover new people through algorithm-powered recommendations.

## Features

- **Search Nostr Profiles**  
  Enter a name, public key, NIP-05, or other identifier to find profiles.
- **Profile & Reputation Viewer**  
  View detailed information about any Nostr profile, including bio, website, lightning address, reputation status, and top followers.
- **Discovery**  
  Discover new people on Nostr through algorithm-powered recommendations.
- **Open Ranking Agnostic**  
  Switch to any compatible [Open Ranking](https://github.com/Open-Ranking/protocol) provider, and select any algorithm the provider supports.
- **Real-time Statistics**  
  Analyse spam-free statistics about the Nostr network, including total and active users and number of posts.

## Tech Stack

- **Frontend:** SvelteKit (SSR, fast page loads)
- **Nostr:** `nostr-tools` for encoding/decoding and event signing
- **Ranking:** [`open-ranking` JS SDK](https://github.com/vertexlab/open-ranking) for reputation, search, discovery, and statistics

## Development

Make sure to have `node` and `pnpm` installed.

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Configure Environment Variables**
    - `REDIS_ADDRESS`: Address where Redis is running (required for statistics)

3. **Run the dev server:**
   ```bash
   export $(grep -v '^#' .env | xargs) && pnpm dev -- --host 0.0.0.0
   ```

## Credits

- Default provider is [Vertex](https://vertexlab.io)
- Designed by [Vlad](https://npub.world/npub1t3gd5yefglarhar4n6uh34uymvft4tgu8edk5465zzhtv4rrnd9sg7upxq)
