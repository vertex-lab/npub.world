<script lang="ts">
	let { data } = $props();
</script>

<style>
  .rounded-image {
    border-radius: 50%;
    max-width: 120px;
  }
  .small {
    max-width: 30px;
  }
</style>

<img alt="profile pic" src={data.picture} class="rounded-image" />

<h1>{data.name}</h1>
<p><strong>{data.npub}</strong></p>
<p><strong>{data.nip05}</strong></p>
<pre>{data.about}</pre>

<h2>Reputable follows</h2>

{#each data.reputable as profile}
  <p>
    <img alt="profile pic" src={profile.picture} class="rounded-image small" />
    <a href={'/' + profile.npub}>{profile.name}</a>
  </p>
{/each}