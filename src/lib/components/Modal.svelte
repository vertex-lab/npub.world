<script>
  import { browser } from '$app/environment';
  import { onMount, onDestroy } from 'svelte';
  import { onEsc } from '$lib/events';

  let { title, onclose, children } = $props();

  onMount(() => { if (browser) document.addEventListener('keydown', onEsc(onclose)); });
  onDestroy(() => { if (browser) document.removeEventListener('keydown', onEsc(onclose)); });
</script>

<div
  class="modal-overlay"
  role="button"
  tabindex="0"
  onclick={onclose}
  onkeydown={(e) => e.key === 'Enter' || e.key === ' ' ? onclose() : null}
  aria-label="Close modal"
>
  <div
    class="modal"
    role="document"
    onclick={(e) => e.stopPropagation()}
    onkeydown={(e) => e.stopPropagation()}
  >
    <div class="modal-header">
      <p class="modal-title">{title}</p>
      <button class="close-button" onclick={onclose} aria-label="Close">✕</button>
    </div>

    {@render children()}
  </div>
</div>

<style>
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: var(--overlay-color);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
  }

  .modal {
    background: var(--card-background);
    box-shadow: var(--shadow-elevation-modal);
    text-align: left;
    padding: 1rem;
    border-radius: 12px;
    width: 80%;
    max-width: 400px;
    max-height: 80vh;
    overflow-y: auto;
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .modal-title {
    margin: 10px;
    font-size: 1.25rem;
    font-weight: 500;
    color: var(--secondary-text);
  }

  .close-button {
    background: none;
    border: none;
    color: var(--primary-text);
    font-size: 1.2rem;
    padding: 0;
    cursor: pointer;
  }
</style>
