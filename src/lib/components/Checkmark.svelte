<script>
  export let size = 16;
  export let variant = "blue"; // "blue" or "gold"
  export let tooltip = false;
</script>

<span class="wrapper">
  <svg
    class="checkmark"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={variant === "gold" ? "url(#gold-gradient)" : "#2B7FFF"}
    aria-hidden="true"
  > 

    <defs>
      <linearGradient id="gold-gradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FFB700" />
        <stop offset="50%" stop-color="#FFB700" />
        <stop offset="50.01%" stop-color="#CE751C" />
        <stop offset="100%" stop-color="#F7AD04" />
      </linearGradient>
    </defs>

    <path d="m23 12l-2.44-2.79l.34-3.69l-3.61-.82l-1.89-3.2L12 2.96L8.6 1.5L6.71 4.69L3.1 5.5l.34 3.7L1 12l2.44 2.79l-.34 3.7l3.61.82L8.6 22.5l3.4-1.47l3.4 1.46l1.89-3.19l3.61-.82l-.34-3.69zm-12.91 4.72l-3.8-3.81l1.48-1.48l2.32 2.33l5.85-5.87l1.48 1.48z" />
  </svg>

  {#if tooltip}
    <span class="tooltip">
      {variant === "gold"
      ? "Earned by being in the top 0.01%"
      : "Earned by being in the top 1%"}
    </span>
  {/if}
</span>
  
<style>
  .checkmark {
    transform: translateY(4px);
  }

  .wrapper {
    display: inline-block;
    position: relative;
  }

  .tooltip {
    visibility: hidden;
    position: absolute;
    top: 20%;
    left: 120%;
    white-space: nowrap;
    color: var(--secondary-text);
    font-size: 0.9rem;
    font-weight: normal;
    transition: opacity 0.3s;
  }

  .wrapper:hover .tooltip {
    visibility: visible;
  }

  @media (max-width: 576px) {
  .tooltip {
    display: none;
  }
}

</style>
  