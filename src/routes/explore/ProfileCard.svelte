<script>
  import ProfilePicture from '$lib/components/ProfilePicture.svelte';

  let { profile } = $props();
</script>

<div class="card">
  <a class="card-link" href="/{profile.npub}" tabindex="-1" aria-hidden="true"></a>

  <div class="pfp-wrapper">
    <ProfilePicture source={profile.picture} />
  </div>

  <div class="info">
    <a class="name" href="/{profile.npub}">{profile.name ?? 'Unknown'}</a>
    {#if profile.nip05}
        <p class="nip05">{profile.nip05}</p>
    {/if}
    {#if profile.about}
        <p class="about">{profile.about}</p>
    {/if}
  </div>
</div>

<style>
  .card {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    border: 1px solid var(--border-color);
    border-radius: 12px;
    background: var(--card-background);
    box-shadow: var(--shadow-elevation-low);
    overflow: hidden;
    padding: 1.25rem 1rem 1.25rem;
    transition: box-shadow 0.2s ease, transform 0.2s ease;
  }

  .card:hover {
    box-shadow: var(--shadow-elevation-high);
    transform: translateY(-2px);
  }

  /* invisible full-card link sitting behind everything */
  .card-link {
    position: absolute;
    inset: 0;
    z-index: 0;
  }

  .pfp-wrapper {
    position: relative;
    z-index: 1;
    margin-bottom: 0.75rem;
  }

  .pfp-wrapper :global(.profile-avatar) {
    --size: 100px;
  }

  .info {
    position: relative;
    z-index: 1;
    width: 100%;
    text-align: center;
  }

  .name {
    display: block;
    font-weight: 500;
    font-size: 1rem;
    color: var(--primary-text);
    text-decoration: none;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 0.15rem;
  }

  .nip05 {
    font-size: 0.75rem;
    color: var(--secondary-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin: 0 0 0.6rem;
  }

  .about {
    font-size: 0.7rem;
    color: var(--secondary-text);
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-align: center;
  }
</style>
