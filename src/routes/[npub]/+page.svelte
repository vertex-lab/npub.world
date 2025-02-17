<script lang="ts">
	let { data } = $props();
</script>

<style>
  .rounded-image {
    border-radius: 50%;
    max-width: 120px;
  }
</style>

<img alt="profile pic" src={data.picture} class="rounded-image" />

<h1>{data.name}</h1>
<strong>{data.nip05}</strong>
<pre>{data.about}</pre>