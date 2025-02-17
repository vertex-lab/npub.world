<script lang="ts">
	let { data } = $props();
</script>

<style>
  .rounded-image {
    border-radius: 50%;
    max-width: 120px;
  }

  .profile-container {
      display: flex;
      align-items: center;
  }

  .profile-picture {
      width: 35px;
      height: 35px;
      border-radius: 50%;
      margin: 0.5em 0.5em 0.5em 0;
  }

  .profile-info {
      display: flex;
      flex-direction: column;
  }

  .profile-name {
      margin: 0;
  }
</style>

<img alt="profile pic" src={data.picture} class="rounded-image" />

<h1>{data.name}</h1>
<p><strong>{data.npub}</strong></p>
<p><strong>{data.nip05}</strong></p>
<p>{data.about}</p>

<h2>Reputable follows</h2>

{#each data.reputable as profile}
  <div class="profile-container">
    <img src={profile.picture} alt="Profile Picture" class="profile-picture" />
    <div class="profile-info">
        <a class="profile-name" href={'/' + profile.npub}>{profile.name}</a>
    </div>
  </div>
{/each}

<p>
  <br/>
  <small>Ranked by the <a href="https://vertexlab.io">Vertex</a> Global Pagerank algorithm</small>
</p>