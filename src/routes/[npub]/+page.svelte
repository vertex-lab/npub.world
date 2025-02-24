<script>
  let { data } = $props();
</script>

{#if Object.keys(data).length === 0}
  <h2>Not found</h2>
{:else}
  <div class="profile-container">
    <img src={data.picture} alt="Profile" class="profile-picture big" />
    <div class="profile-info">
      <h1>{data.name}</h1>
    </div>
  </div>

  <div style="overflow-wrap: break-word">
    <p><strong>{data.npub}</strong></p>
    <p><strong>{data.nip05}</strong></p>
    <p class="about">{@html data.about}</p>
  </div>

  <h3>Reputable followers</h3>

  {#each data.reputable as profile}
    <div class="profile-container">
      <img src={profile.picture} alt="Profile" class="profile-picture" />
      <div class="profile-info">
        <a class="profile-name" href={"/" + profile.npub}>{profile.name}</a>
      </div>
    </div>
  {/each}
{/if}
