<script>
  import { enhance } from '$app/forms';

  let { form } = $props();
  let loading = $state(false);
</script>

<svelte:head>
  <title>Explore – npub.world</title>
</svelte:head>

<div class="explore">
  <h1>Explore</h1>
  <p class="subtitle">Enter an npub or hex pubkey to get recommendations.</p>

  <form
    method="POST"
    action="?/recommend"
    use:enhance={() => {
      loading = true;
      return ({ update }) => {
        loading = false;
        update();
      };
    }}
  >
    <div class="input-row">
      <input
        type="text"
        name="pubkey"
        placeholder="npub1… or hex pubkey"
        autocomplete="off"
        spellcheck="false"
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Loading…' : 'Recommend'}
      </button>
    </div>

    {#if form?.error}
      <p class="error">{form.error}</p>
    {/if}

    {#if form?.ok}
      <p class="success">Done! Check the server logs for the result.</p>
    {/if}
  </form>
</div>

<style>
  .explore {
    max-width: 600px;
    margin: 2rem auto;
    padding: 0 1rem;
  }

  h1 {
    font-size: 1.5rem;
    margin-bottom: 0.25rem;
  }

  .subtitle {
    color: var(--secondary-text);
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
  }

  .input-row {
    display: flex;
    gap: 0.5rem;
  }

  input {
    flex: 1;
    padding: 0.5rem 0.75rem;
    font-size: 0.9rem;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: var(--input-bg, var(--bg));
    color: var(--primary-text);
    font-family: monospace;
  }

  input:focus {
    outline: none;
    border-color: var(--accent, #7b5ea7);
  }

  button {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
    border: none;
    border-radius: 6px;
    background: var(--accent, #7b5ea7);
    color: #fff;
    cursor: pointer;
    transition: opacity 0.15s;
  }

  button:disabled {
    opacity: 0.6;
    cursor: default;
  }

  .error {
    margin-top: 0.75rem;
    color: var(--error, #e05);
    font-size: 0.875rem;
  }

  .success {
    margin-top: 0.75rem;
    color: var(--success, #2a9d5c);
    font-size: 0.875rem;
  }
</style>
