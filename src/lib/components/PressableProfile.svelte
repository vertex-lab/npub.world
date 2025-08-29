<script>
  import ProfilePicture from "./ProfilePicture.svelte";
  import ReputationBadge from "./ReputationBadge.svelte";
  import { truncateString } from "$lib/string.js"

  let { profile, style, reputationBadge } = $props();
</script>

<a href={"/" + profile.npub } data-sveltekit-preload-data="off">
  <div class="profile-item" style={style}>
    <ProfilePicture source={profile.picture}/>
    <div class="profile-info">
      <div class="profile-name">
        {profile.name}
        {#if reputationBadge }
          <ReputationBadge reputation={profile.reputation} size={16} />
        {/if}
      </div>
      <div class="profile-nip05">
        {#if profile.nip05 && profile.nip05.length > 0}
          {truncateString(profile.nip05, 25)}
        {/if}
      </div>
    </div>
  </div>
</a>

<style>
a {
  color: var(--primary-color);
  text-decoration: none;
}

.profile-item {
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.profile-item:hover {
  background-color: var(--highlight-color);
  cursor: pointer;
}

.profile-info {
  overflow: hidden;
}

.profile-name {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.profile-nip05 {
  font-size: 0.75rem;
  color: var(--light-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
