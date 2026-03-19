<script>
  import { onEnter } from "$lib/events";

  let copied = $state(false);

  function copy() {
      navigator.clipboard.writeText(window.location.href)
      .then(() => {
          copied = true;
          setTimeout(() => copied = false, 2000);
      })
      .catch(err => console.error('Failed to copy text:', err));
  }

  $effect(() => {
      copied = false;
  });
</script>

<button
  type="button"
  class="copy-container"
  onclick={copy}
  onkeydown={onEnter(copy)}
  title="Copy link to clipboard"
>
  <span class="text">Copy</span>
  <span class="icon">
    {#if copied}
      ✓
    {:else}
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16px" height="16px" viewBox="0 0 24 24">
            <title xmlns="">link</title>
            <g
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </g>
        </svg>
    {/if}
  </span>
</button>

<style>
  .copy-container {
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    height: 40px;
    width: 90px;

    border-radius: 8px;
    cursor: pointer;
    user-select: none;
    border: 1px solid var(--border-color);
    background-color: var(--card-background);
    color: var(--primary-text);
    font-size: 0.9rem;
    text-align: left;
  }

  .text {
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .icon {
    display: flex;
    align-items: center;
    width: 18px;
    height: 18px;
  }

  @media(max-width: 450px) {
    .copy-container {
        width: 40px;
        height: 40px;
    }

    .text {
        display: none;
    }
  }
</style>
