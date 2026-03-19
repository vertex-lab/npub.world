<script>
  /** @type {{ leak: import("$lib/profile.js").Leak }} */
  let { leak } = $props();

  function unixToDate(unix) {
    if (!unix) return null;
    return new Date(unix * 1000).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function newConfig(leak) {
    switch (leak.status) {
      case "suspected":
        return {
          title: "Suspected Key Leak",
          subtitle: `The nsec of this profile may have been leaked. Be cautious.`,
          variant: "warning",
        };

      case "confirmed":
        const detectionDate = leak?.detected_at ? ` on ${unixToDate(leak.detected_at)}` : "";
        return {
          title: "Key Leaked",
          subtitle: `The nsec of this profile has been leaked${detectionDate}. Do not trust.`,
          variant: "danger",
        };

      default:
        return null;
    }
  }

  const config = $derived(newConfig(leak));
</script>

{#if config}
  <div class="banner banner--{config.variant}">
    <span class="icon">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24px" height="24px"
            viewBox="0 0 24 24">
                <title xmlns="">triangle-alert</title>
                <path fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="m21.73 18l-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3M12 9v4m0 4h.01"/>
            </svg>
    </span>

    <div class="content">
      <span class="title">{config.title}</span>
      <span class="subtitle">{config.subtitle}</span>
    </div>
  </div>
{/if}

<style>
  .banner {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 10px 14px;
    border-radius: 8px;
    border-left: 2px solid var(--leak-accent-text);
    background-color: var(--leak-accent);
    color: var(--leak-accent-text);
    width: fit-content;
    max-width: 500px;
  }

  .banner--warning {
    --leak-accent:      var(--warning-accent);
    --leak-accent-text: var(--warning-accent-text);
  }

  .banner--danger {
    --leak-accent:      var(--danger-accent);
    --leak-accent-text: var(--danger-accent-text);
  }

  .icon {
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .title {
    font-size: 0.85rem;
    font-weight: 700;
  }

  .subtitle {
    font-size: 0.78rem;
    opacity: 0.8;
  }
</style>
