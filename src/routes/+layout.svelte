<script>
	import { page } from "$app/stores";
	import { onMount } from "svelte";

	let { children } = $props();

	const shoutouts = [
		{ label: "Powered by", href: "https://vertexlab.io", text: "Vertex" },
		{ label: "Designed by", href: "/npub1t3gd5yefglarhar4n6uh34uymvft4tgu8edk5465zzhtv4rrnd9sg7upxq", text: "Vlad" },
	]

	// read the data-theme attribute that we set in app.html
	let isDarkMode = $state(
		typeof document !== "undefined" &&
		document.documentElement.getAttribute("data-theme") === "dark"
	);

	function toggleTheme() {
		isDarkMode = !isDarkMode;

		// store new theme
		const newTheme = isDarkMode ? "dark" : "light";
		document.documentElement.setAttribute("data-theme", newTheme);
		localStorage.setItem("theme", newTheme);
	}
</script>

<main class="container">
	{@render children()}
</main>

<footer>
	<div class="shoutouts">
		{#each shoutouts as item, i}
			<p>{item.label} <a href={item.href}>{item.text}</a></p>

			{#if i < shoutouts.length - 1}
				<p class="separator">•</p>
			{/if}
		{/each}
	</div>

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
	footer {
		padding-bottom: 2rem;
	}

	.shoutouts {
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 0.8rem;
		color: var(--secondary-text);
		margin: 0rem auto;
		height: 1rem;
	}

	.separator {
		margin: 0 0.5rem;
	}

	.theme-container {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-top: 1rem;
	}

	.theme-toggle {
		background: none;
		border: 1px solid var(--border-color);
		cursor: pointer;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: var(--card-background);
		box-shadow: var(--shadow-elevation-low);
		transition: all 0.2s;
	}

	.theme-toggle:hover {
		background-color: var(--highlight-color);
	}
</style>