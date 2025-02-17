<script lang="ts">
	let { children } = $props();
</script>

<main class="container">
	<h1><a href="/">npub.world 🌎</a></h1>
	<br/>
	{@render children()}
</main>