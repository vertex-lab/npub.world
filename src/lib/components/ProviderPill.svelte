<script>
  import { fetchCapabilities, ENDPOINT_STATS_PUBKEY, ENDPOINT_RANK_PUBKEYS, ENDPOINT_SEARCH_PUBKEYS, ENDPOINT_RECOMMEND_PUBKEYS, ENDPOINT_FOLLOWERS, ENDPOINT_COMPROMISED_PUBKEYS } from 'open-ranking';
  import { invalidateAll } from '$app/navigation';
  import Modal from './Modal.svelte';
  import { settings, setProvider } from '$lib/settings.svelte.js';
  import { logout } from '$lib/auth.svelte.js';
  import { ranker } from '$lib/open-ranking.js';
  import { safeURL } from '$lib/string.js';

  const ENDPOINTS = [
    { key: ENDPOINT_STATS_PUBKEY,      label: 'Profile (ORE-02)',   required: true },
    { key: ENDPOINT_RANK_PUBKEYS,      label: 'Ranking (ORE-03)',   required: true },
    { key: ENDPOINT_RECOMMEND_PUBKEYS, label: 'Discovery (ORE-04)', required: false },
    { key: ENDPOINT_SEARCH_PUBKEYS,    label: 'Search (ORE-05)',    required: true },
    { key: ENDPOINT_FOLLOWERS,         label: 'Followers (ORE-06)', required: false },
    { key: ENDPOINT_COMPROMISED_PUBKEYS, label: 'Compromised (ORE-08)', required: false },
  ];

  let showModal = $state(false);
  let inputValue = $state('');
  let validating = $state(false);
  let caps = $state(null);
  let error = $state(null);
  let inputRef = $state(null);

  let isValidUrl = $derived(validUrl(inputValue));

  function normalize(s) {
    const t = s.trim();
    if (t && !t.startsWith('http://') && !t.startsWith('https://')) return 'https://' + t;
    return t;
  }

  function validUrl(s) {
    try { new URL(normalize(s)); return true; }
    catch { return false; }
  }

  let canSave = $derived(
    caps !== null && ENDPOINTS.filter(e => e.required).every(e => caps[e.key]?.length > 0)
  );

  function hostname(url) {
    try { return new URL(url).hostname; }
    catch { return url; }
  }

  function openModal() {
    inputValue = '';
    caps = null;
    error = null;
    showModal = true;
    setTimeout(() => inputRef?.focus(), 0);
  }

  async function validate() {
    const url = normalize(inputValue);
    if (!url) return;
    try { safeURL(url); } catch (e) { error = e.message; return; }
    validating = true;
    caps = null;
    error = null;
    try {
      caps = await fetchCapabilities(url, { timeout: 5000 });
    } catch (e) {
      error = e.message;
    }
    validating = false;
  }

  function handleKeydown(e) {
    if (e.key === 'Enter' && isValidUrl) {
      e.preventDefault();
      validate();
    }
  }

  function save() {
    const url = normalize(inputValue);
    setProvider(url);
    logout(); // NWT was scoped to the old provider's aud; force re-login
    ranker.add(url); // pre-warm server-side on next SSR load; fire-and-forget
    showModal = false;
    invalidateAll(); // re-run load functions with the new provider cookie
  }
</script>

<button class="pill" onclick={openModal}>
  {hostname(settings.provider)}
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>
</button>

{#if showModal}
  <Modal
    title="Provider"
    subtitle="Change your open-ranking provider"
    onclose={() => showModal = false}
  >
    <div class="modal-body">
      <div class="input-group">
        <input
          class="url-input"
          type="url"
          bind:value={inputValue}
          oninput={() => { caps = null; error = null; }}
          onkeydown={handleKeydown}
          placeholder="https://ranking.example.com"
          spellcheck="false"
          autocomplete="off"
          bind:this={inputRef}
        />

      </div>

      <div class="caps">
        <div class="caps-header">
          <p class="caps-title">Capability</p>
          <p class="caps-title">Status</p>
        </div>
        <ul class="cap-list">
          {#each ENDPOINTS as ep}
            {@const supported = caps?.[ep.key]?.length > 0}
            <li class="cap-row">
              <div class="cap-info">
                <span class="cap-name">{ep.label}</span>
                <span class="cap-tag">{ep.required ? 'required' : 'optional'}</span>
              </div>
              <div class="cap-status">
                {#if validating}
                  <span class="spinner"></span>
                {:else if caps}
                  {#if supported}
                    <svg class="icon ok" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  {:else}
                    <svg class="icon fail" class:required={ep.required} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  {/if}
                {/if}
              </div>
            </li>
          {/each}
        </ul>
      </div>

      {#if error}
        <p class="error">{error}</p>
      {/if}

      <div class="footer">
        <button class="btn-cancel" onclick={() => showModal = false}>Cancel</button>
        {#if caps === null}
          <button class="btn-save" onclick={validate} disabled={validating || !isValidUrl}>Validate</button>
        {:else}
          <button class="btn-save" onclick={save} disabled={!canSave}>Save</button>
        {/if}
      </div>
    </div>
  </Modal>
{/if}

<style>
  /* Pill */
  .pill {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: var(--font-body);
    color: var(--secondary-text);
    background: var(--card-background);
    border: 1px solid var(--border-color);
    border-radius: 999px;
    padding: 6px 10px;
    cursor: pointer;
    white-space: nowrap;
    flex-shrink: 0;
    box-shadow: var(--shadow-elevation-low);
    transition: color 0.15s, border-color 0.15s, box-shadow 0.15s;
  }

  .pill:hover {
    color: var(--primary-text);
    border-color: var(--secondary-text);
    box-shadow: var(--shadow-elevation-medium);
  }

  /* Modal body */
  .modal-body {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .input-group {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .url-input {
    width: 100%;
    box-sizing: border-box;
    padding: 8px 12px;
    font-size: var(--font-body);
    color: var(--primary-text);
    background: var(--card-background);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    outline: none;
    transition: border-color 0.15s;
  }

  .url-input:focus {
    border-color: var(--secondary-text);
  }

  /* Caps */
  .caps {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1.5rem 0;
  }

  .cap-list {
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    list-style: none;
  }

  .cap-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .caps-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .caps-title {
    font-size: var(--font-caption);
    font-weight: var(--weight-bold);
    color: var(--secondary-text);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0 0 0.25rem;
  }

  .cap-info {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  .cap-name {
    font-size: var(--font-body);
    color: var(--primary-text);
  }

  .cap-tag {
    font-size: var(--font-caption);
    color: var(--secondary-text);
  }

  .cap-status {
    width: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .spinner {
    width: 12px;
    height: 12px;
    border: 2px solid var(--border-color);
    border-top-color: var(--secondary-text);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .icon.ok           { color: var(--blue-accent-text); }
  .icon.fail         { color: var(--light-text); }
  .icon.fail.required { color: var(--error); }

  /* Error */
  .error {
    font-size: var(--font-body);
    color: var(--error);
    margin: 0;
  }

  /* Footer */
  .footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }

  .btn-cancel, .btn-save {
    padding: 6px 16px;
    font-size: var(--font-body);
    border-radius: 8px;
    cursor: pointer;
    border: 1px solid var(--border-color);
    transition: background 0.15s, color 0.15s, border-color 0.15s;
  }

  .btn-cancel {
    background: var(--card-background);
    color: var(--secondary-text);
  }

  .btn-cancel:hover {
    color: var(--primary-text);
    border-color: var(--secondary-text);
  }

  .btn-save {
    background: var(--blue-accent);
    color: var(--blue-accent-text);
    border-color: color-mix(in srgb, var(--blue-accent-text) 35%, transparent);
  }

  .btn-save:hover:not(:disabled) {
    background: color-mix(in srgb, var(--blue-accent) 70%, var(--blue-accent-text));
  }

  .btn-save:disabled {
    opacity: 0.4;
    cursor: default;
  }
</style>
