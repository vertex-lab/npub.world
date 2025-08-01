<script>
    import { fallbackImage } from "$lib/constants.js";

  export let source = "";
  export let size = "40px";
  $: image = source || fallbackImage;
</script>

<div class="profile-avatar" style="--size: {size}">
    <img src={image} alt="Profile Avatar" />
</div>

<style>
  .profile-avatar {
    overflow: hidden;
    margin-right: 1.5rem;
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