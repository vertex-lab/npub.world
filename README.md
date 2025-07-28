# npub.world

A Nostr profile search engine and viewer by [Vertex](https://vertexlab.io).

## What is npub.world?

**npub.world** is a web application for searching and viewing Nostr profiles. It allows to search for Nostr users by their name, public key, NIP-05 identifier, or other profile information, and view detailed information about each profile, including reputation and top followers.

## Features

- **Search Nostr Profiles:**  
  Enter a name, Nostr public key, NIP-05, or other identifier to find profiles.
- **Profile Viewer:**  
  View detailed information about any Nostr profile, including bio, website, lightning address, and more.
- **Reputation & Followers:**  
  See reputation status and top followers for each profile.
- **Responsive UI:**  
  Clean, mobile-friendly interface with dark/light mode toggle.

## Tech Stack

- **Frontend:** SvelteKit
- **Backend:** Serverless endpoints (SvelteKit API routes)
- **Nostr:** Uses `nostr-tools` for encoding/decoding and event signing
- **Vertex:** For reputation requests and search

## Development
Make sure to have `node` and `pnpm` installed

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Configure Enviroment Variables**
    - `SK`: Secret key for signing Nostr events (required for search and reputation queries).

2. **Run the dev server:**
   ```bash
   `export $(grep -v '^#' .env | xargs) && pnpm dev`
   ```


## Credits

- Built by [Vertex](https://vertexlab.io)
- Designed by [Vlad](https://npub.world/npub1t3gd5yefglarhar4n6uh34uymvft4tgu8edk5465zzhtv4rrnd9sg7upxq)