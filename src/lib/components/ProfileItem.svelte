<script>
  import ProfilePicture from "./ProfilePicture.svelte";

  const { profile, style = "" } = $props();
</script>

<a href={"/" + profile.npub}>
  <div class="profile-item" style={style}>
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
