<script>
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

<main class="container">
	{@render children()}
</main>

<footer>
	<p>
		Powered by <a href="https://vertexlab.io">Vertex</a> 
		&nbsp; • &nbsp;
		Designed by <a href="/npub1t3gd5yefglarhar4n6uh34uymvft4tgu8edk5465zzhtv4rrnd9sg7upxq">Vlad</a>
	</p>
	<div class="theme-container">
		<button
			class="theme-toggle"
			onclick={toggleTheme}
			title="Toggle dark/light mode"
		>
			{#if isDarkMode}
				<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" height="24px" width="24px" viewBox="0 0 24 24"><path d="M7 12a5 5 0 1 1 5 5 5 5 0 0 1-5-5zm5-7a1 1 0 0 0 1-1V3a1 1 0 0 0-2 0v1a1 1 0 0 0 1 1zm-1 15v1a1 1 0 0 0 2 0v-1a1 1 0 0 0-2 0zm10-9h-1a1 1 0 0 0 0 2h1a1 1 0 0 0 0-2zM3 13h1a1 1 0 0 0 0-2H3a1 1 0 0 0 0 2zm14.657-5.657a1 1 0 0 0 .707-.293l.707-.707a1 1 0 1 0-1.414-1.414l-.707.707a1 1 0 0 0 .707 1.707zM5.636 16.95l-.707.707a1 1 0 1 0 1.414 1.414l.707-.707a1 1 0 0 0-1.414-1.414zm11.314 0a1 1 0 0 0 0 1.414l.707.707a1 1 0 0 0 1.414-1.414l-.707-.707a1 1 0 0 0-1.414 0zM5.636 7.05A1 1 0 0 0 7.05 5.636l-.707-.707a1 1 0 0 0-1.414 1.414z" fill="#d48319" stroke="none"/></svg>
			{:else}
				<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" height="24px" width="24px" viewBox="0 0 128 128"><path d="M77.849 82.92a32.765 32.765 0 0 1-17.59-60.411 41.663 41.663 0 1 0 45.232 45.232A32.736 32.736 0 0 1 77.849 82.92z" fill="#ffc82c" stroke="none"/></svg>
			{/if}
		</button>
	</div>
</footer>

<style>
</style>