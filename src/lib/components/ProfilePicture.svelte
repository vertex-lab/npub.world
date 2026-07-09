<script>
  import { settings } from '$lib/settings.svelte.js';
  import { fallbackUserDark, fallbackUserLight } from '$lib/fallbacks.js';

  let { source, class: className } = $props();

  let src = $derived(source || (settings.theme === 'dark' ? fallbackUserDark : fallbackUserLight));
</script>

<div class={`${className} profile-avatar`}>
  <img {src} alt="Profile Avatar" />
</div>

<style>
  .profile-avatar {
    --size: 40px;
    overflow: hidden;
    border-radius: 50%;
    width: var(--size);
    height: var(--size);
    flex-shrink: 0;
  }

  .profile-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
</style>
