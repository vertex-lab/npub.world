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
        width="18"
        height="18"
        viewBox="-2.4 -2.4 28.8 28.8"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
      >
        <path d="M15.197 3.35462C16.8703 1.67483 19.4476 1.53865 20.9536 3.05046C22.4596 4.56228 22.3239 7.14956 20.6506 8.82935L18.2268 11.2626M10.0464 14C8.54044 12.4882 8.67609 9.90087 10.3494 8.22108L12.5 6.06212"/>
        <path d="M13.9536 10C15.4596 11.5118 15.3239 14.0991 13.6506 15.7789L11.2268 18.2121L8.80299 20.6454C7.12969 22.3252 4.55237 22.4613 3.0464 20.9495C1.54043 19.4377 1.67609 16.8504 3.34939 15.1706L5.77323 12.7373"/>
      </svg>
    {/if}
  </span>
</button>

<style>
  .copy-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
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
    margin-left: 8px;
    width: 18px;
    height: 18px;
  }

  @media(max-width: 450px) {
    .copy-container {
        padding: 10px;
    }

    .text {
        display: none;
    }

    .icon {
        margin-left: 0;
    }

  }
</style>
