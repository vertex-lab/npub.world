<script>
  import Modal from './Modal.svelte';

  let { algorithms, selected, onselect, onclose } = $props();
</script>

<Modal title="Algorithm" {onclose}>
  {#each algorithms as algo}
    <button
      class="algo-option"
      class:selected={selected?.id === algo.id}
      onclick={() => onselect(algo)}
    >
      <span class="algo-name">{algo.name}</span>
      {#if algo.description}
        <span class="algo-desc">{algo.description}</span>
      {/if}
    </button>
  {/each}
</Modal>

<style>
  .algo-option {
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
    font-size: 1rem;
    color: var(--primary-text);
  }

  .algo-desc {
    font-size: 0.75rem;
    color: var(--secondary-text);
    margin-top: 2px;
  }
</style>
