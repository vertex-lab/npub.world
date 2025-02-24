<script>
	import { npubEncode } from "nostr-tools/nip19";
	import { page } from "$app/stores";

	let { children } = $props();
</script>

<svelte:head>
	<title>{$page?.url?.pathname?.slice(1)}</title>
</svelte:head>

<main class="container">
	<h1><a id="logo" href="/">npub.world 🌎</a></h1>
	<br />
	{@render children()}
</main>

<footer>
	<p>
		<small
			>Ranked by the <a href="https://vertexlab.io">Vertex</a> Global Pagerank algorithm</small
		>
	</p>
</footer>
