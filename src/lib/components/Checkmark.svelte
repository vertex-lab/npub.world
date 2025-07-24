<!-- src/lib/components/Checkmark.svelte -->
<script>
    export let size = 16;
    export let variant = "blue"; // "blue" or "gold"
  </script>
  
  <svg
    class="checkmark"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={variant === "gold" ? "url(#gold-gradient)" : "#2B7FFF"}
    aria-hidden="true"
  >
    {#if variant === "gold"}
      <defs>
        <linearGradient id="gold-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#FFB700" />
          <stop offset="50%" stop-color="#FFB700" />
          <stop offset="50.01%" stop-color="#CE751C" />
          <stop offset="100%" stop-color="#F7AD04" />
        </linearGradient>
      </defs>
    {/if}
  
    <path d="m23 12l-2.44-2.79l.34-3.69l-3.61-.82l-1.89-3.2L12 2.96L8.6 1.5L6.71 4.69L3.1 5.5l.34 3.7L1 12l2.44 2.79l-.34 3.7l3.61.82L8.6 22.5l3.4-1.47l3.4 1.46l1.89-3.19l3.61-.82l-.34-3.69zm-12.91 4.72l-3.8-3.81l1.48-1.48l2.32 2.33l5.85-5.87l1.48 1.48z" />
  </svg>
  
  <style>
    .checkmark {
      transform: translateY(4px);
    }
  </style>
  