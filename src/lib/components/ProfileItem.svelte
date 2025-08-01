<script>
  import ProfilePicture from "./ProfilePicture.svelte";

  const { profile } = $props();
</script>

<a href={"/" + profile.npub}>
  <div class="profile-item">
    <ProfilePicture source={profile.picture} size="40px" />
    <div class="profile-info">
      <div class="profile-name">{profile.name}</div>
      <div class="profile-nip05">{profile.nip05}</div>
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
    padding: 5px;
    border-radius: 8px;
    transition: background-color 0.2s;
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
