<script>
  const { profile } = $props();
</script>

<a href={"/" + profile.npub}>
  <div class="follower-item">
    <div class="follower-avatar">
      <img src={profile.picture} alt="Follower Avatar" />
    </div>
    <div class="follower-info">
      <div class="follower-name">{profile.name}</div>
      <div class="follower-handle">{profile.nip05}</div>
    </div>
  </div>
</a>

<style>
  a {
    color: var(--primary-color);
    text-decoration: none;
  }

  .follower-item {
    display: flex;
    align-items: center;
    padding: 5px;
    border-radius: 8px;
    transition: background-color 0.2s;
  }

  .follower-avatar {
    min-width: 40px;
    height: 40px;
    border-radius: 50%;
    overflow: hidden;
    margin-right: 10px;
  }

  .follower-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .follower-info {
    overflow: hidden;
  }

  .follower-name {
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .follower-handle {
    font-size: 0.75rem;
    color: var(--light-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
