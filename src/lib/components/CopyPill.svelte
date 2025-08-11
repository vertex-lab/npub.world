<script>
  import { onMount } from "svelte";
  import { copyToClipboard, truncateString } from "$lib/utils";
  let { text, color, backgroundColor } = $props();

  let displayText = $state(text);
  let copied = $state(false);

  const resize = () => {
    const width = window.innerWidth
    if (width < 400) {
      displayText = truncateString(text, 18);
    } else if (width < 768) {
      displayText = truncateString(text, 29);
    } else if (width < 992) {
      displayText = truncateString(text, 40);
    } else {
      displayText = text;
    }
  };

  onMount(() => {
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  });

  $effect(() => {
    resize();
  });

  function enterCopyToClickboard(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      copyToClipboard();
    }
  }
</script>

<button
  type="button"
  class="copy-container"
  onclick={copyToClipboard}
  onkeydown={enterCopyToClickboard}
  aria-label="Copy {text} to clipboard"
  style="background-color: {backgroundColor}; color: {color}"
>
  <span class="text">{displayText}</span>
  <span class="icon">
    {#if copied}
      ✓
    {:else}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
        ></path>
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
    transition: background-color 0.2s;
    border: none;
    font-size: 0.9rem;
    text-align: left;
  }

  .copy-container:hover {
    background-color: #fff3cd;
  }

  .text {
    display: block;
    font-family: sans-serif;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .icon {
    display: flex;
    align-items: center;
    margin-left: 8px;
  }

  /* Animation for the copied state */
  .icon :global(svg) {
    transition: transform 0.2s;
  }

  .copy-container:active .icon :global(svg) {
    transform: scale(0.9);
  }
</style>
