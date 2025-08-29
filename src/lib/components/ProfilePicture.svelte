<script>
  let { source, class: className } = $props();
</script>

<div class={`${className} profile-avatar`}>
  <img src={source} alt="Profile Avatar" />
</div>

<style>
  .profile-avatar {
    --size: 40px;
    overflow: hidden;
    margin-right: 0.8rem;
    border-radius: 50%;
    width: var(--size);
    height: var(--size);
    flex-shrink: 0; /* Prevents shrinking in flex containers */
  }

  .profile-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
</style>