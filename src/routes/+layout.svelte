<script>
	import { npubEncode } from "nostr-tools/nip19";
	import { page } from "$app/stores";

	let { children } = $props();
</script>

<svelte:head>
	<title>{$page?.url?.pathname?.slice(1)}</title>
</svelte:head>

<main class="container">
	{@render children()}
</main>

<footer>
	<p class="disclaimer">
		Results are processed in real time by the <a href="https://vertexlab.io"
			>Vertex</a
		> Global Pagerank algorithm to display authentic profiles, excluding bots, spammers
		and impersonators.
	</p>
</footer>
