<script>
	import { npubEncode } from "nostr-tools/nip19";
	import { page } from "$app/stores";
	import { onMount } from "svelte";

	let { children } = $props();
	let isDarkMode = $state(false);

	onMount(() => {
		// Check for saved theme preference or use system preference
		const savedTheme = localStorage.getItem("theme");
		if (savedTheme) {
			document.documentElement.setAttribute("data-theme", savedTheme);
			isDarkMode = savedTheme === "dark";
		} else if (
			window.matchMedia &&
			window.matchMedia("(prefers-color-scheme: dark)").matches
		) {
			document.documentElement.setAttribute("data-theme", "dark");
			isDarkMode = true;
		}
	});

	function toggleTheme() {
		// Toggle the isDarkMode state
		isDarkMode = !isDarkMode;

		// Apply the theme
		const newTheme = isDarkMode ? "dark" : "light";
		document.documentElement.setAttribute("data-theme", newTheme);
		localStorage.setItem("theme", newTheme);
	}
</script>

<svelte:head>
	<title>{$page?.url?.pathname?.slice(1)}</title>
</svelte:head>

<main class="container">
	{@render children()}
</main>

<footer>
	<p>
		Results are processed in real time by the <a href="https://vertexlab.io"
			>Vertex</a
		>
		Search DVM and sorted by Global Pagerank
	</p>
	<p>
		Design by
		<a href="/npub1t3gd5yefglarhar4n6uh34uymvft4tgu8edk5465zzhtv4rrnd9sg7upxq"
			>Vladimir</a
		>
	</p>
	<p class="theme-container">
		<button
			class="theme-toggle"
			onclick={toggleTheme}
			title="Toggle dark/light mode"
		>
			<span class="theme-toggle-icon">
				{#if isDarkMode}
					☀️
				{:else}
					🌙
				{/if}
			</span>
		</button>
	</p>
</footer>
