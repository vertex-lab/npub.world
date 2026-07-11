<script>
  let { title, subtitle, onclose, children } = $props();
</script>

<svelte:window onkeydown={(e) => { if (e.key === 'Escape') onclose(); }} />

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
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
    onkeydown={(e) => { if (e.key !== 'Escape') e.stopPropagation(); }}
  >
    <div class="modal-header">
      <div class="modal-titles">
        <p class="modal-title">{title}</p>
        {#if subtitle}<p class="modal-subtitle">{subtitle}</p>{/if}
      </div>
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
    padding: 1.5rem;
    border-radius: 12px;
    width: 80%;
    max-width: 400px;
    max-height: 80vh;
    overflow-y: auto;
  }

  .modal-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .modal-titles {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .modal-title {
    margin: 0;
    font-size: var(--font-display);
    font-weight: var(--weight-medium);
    color: var(--primary-text);
  }

  .modal-subtitle {
    margin: 0;
    font-size: var(--font-body);
    color: var(--secondary-text);
    line-height: 1.5;
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
