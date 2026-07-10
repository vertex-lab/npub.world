<script>
  import PressableProfilePicture from './PressableProfilePicture.svelte';

  let { profile, action, stats, banner, name } = $props();
</script>

<div class="profile-header">
  <div class="profile-top">
    <PressableProfilePicture picture={profile.picture} pictureURL={profile.pictureURL} />

    <div class="profile-identity" class:has-action={action}>
      <p class="profile-name">
        {#if name}{@render name()}{:else}{profile.name}{/if}
      </p>

      {#if profile.nip05}
        <p class="profile-nip05">{profile.nip05}</p>
      {/if}

      {#if stats}
        {@render stats()}
      {/if}
    </div>

    {#if action}
      <div class="profile-action">
        {@render action()}
      </div>
    {/if}
  </div>

  {#if banner}
    {@render banner()}
  {/if}
</div>

<style>
  .profile-header {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid var(--border-color);
  }

  .profile-top {
    position: relative;
    display: flex;
    align-items: flex-start;
  }

  .profile-identity {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    text-align: left;
    width: 100%;
    margin-left: 0.8rem;
    margin-top: 0.8rem;
    flex-grow: 1;
    overflow: hidden;
  }

  .profile-identity.has-action {
    margin-right: calc(1rem + 90px);
  }

  .profile-name {
    word-wrap: break-word;
    font-size: var(--font-display);
    font-weight: var(--weight-bold);
    margin: 0;
  }

  .profile-nip05 {
    font-size: var(--font-body);
    color: var(--light-text);
    max-width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin: 0;
  }

  .profile-action {
    position: absolute;
    top: 0;
    right: 0;
  }

  @media (max-width: 576px) {
    .profile-header {
      padding-bottom: 1rem;
    }

    .profile-top {
      flex-direction: column;
      align-items: center;
    }

    .profile-identity {
      margin: 0 auto;
      padding-top: 1rem;
      text-align: center;
    }

    .profile-identity.has-action {
      margin-right: auto;
    }
  }
</style>
