<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { auth } from '$lib/auth.svelte.js';
  import Modal from './Modal.svelte';

  let { algorithms, selected, onselect, onclose } = $props();

  function requiresPov(algo) {
    return algo.pov === true;
  }

  function handleSelect(algo) {
    if (requiresPov(algo) && !auth.nwt) {
      onclose();
      if ($page.url.pathname !== '/settings') goto('/settings');
    } else {
      onselect(algo);
    }
  }
</script>

<Modal title="Algorithm" {onclose}>
  {#each algorithms as algo}
    <button
      class="algo-option"
      class:selected={selected?.id === algo.id}
      onclick={() => handleSelect(algo)}
    >
      <span class="algo-name">{algo.name}</span>
      {#if requiresPov(algo)}
        <span class="requires-login">requires login</span>
      {/if}
      {#if algo.description}
        <span class="algo-desc">{algo.description}</span>
      {/if}
    </button>
  {/each}
</Modal>

<style>
  .algo-option {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    text-align: left;
    background: none;
    border: none;
    border-radius: 8px;
    padding: 10px 12px;
    cursor: pointer;
    transition: background 0.15s;
  }

  .algo-option:hover,
  .algo-option.selected {
    background: var(--border-color);
  }

  .algo-name {
    font-size: var(--font-body);
    color: var(--primary-text);
  }

  .algo-desc {
    font-size: var(--font-body);
    color: var(--secondary-text);
    margin-top: 2px;
  }

  .requires-login {
    position: absolute;
    top: 10px;
    right: 12px;
    font-size: var(--font-caption);
    color: var(--secondary-text);
    cursor: pointer;
    transition: color 0.15s;
  }

  .requires-login:hover {
    color: var(--primary-text);
  }
</style>
