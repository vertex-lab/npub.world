<script>
	import { page } from "$app/stores";
	import { onMount } from "svelte";
	import { theme, toggleTheme } from "$lib/theme.svelte";

	let { children } = $props();

	let scrollY = $state(0);
	const navOpacity = $derived(Math.max(0, 1 - scrollY / 80));

	onMount(() => {
		const onScroll = () => scrollY = window.scrollY;
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	});
</script>

<nav class="topnav" style="opacity: {navOpacity}; pointer-events: {navOpacity < 0.1 ? 'none' : 'auto'}">
	<div class="topnav-inner">
		<div class="nav-links">
			<a href="/" class:active={$page.url.pathname === '/'}>Home</a>
			<a href="/stats" class:active={$page.url.pathname === '/stats'}>Stats</a>
			<a href="https://github.com/vertex-lab/npub.world" target="_blank" rel="noopener noreferrer" class="icon-link" aria-label="GitHub">
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
					<path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
				</svg>
			</a>
			<button class="icon-link theme-toggle" onclick={toggleTheme} title="Toggle dark/light mode" aria-label="Toggle theme">
				{#if theme.isDark}
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path d="M7 12a5 5 0 1 1 5 5 5 5 0 0 1-5-5zm5-7a1 1 0 0 0 1-1V3a1 1 0 0 0-2 0v1a1 1 0 0 0 1 1zm-1 15v1a1 1 0 0 0 2 0v-1a1 1 0 0 0-2 0zm10-9h-1a1 1 0 0 0 0 2h1a1 1 0 0 0 0-2zM3 13h1a1 1 0 0 0 0-2H3a1 1 0 0 0 0 2zm14.657-5.657a1 1 0 0 0 .707-.293l.707-.707a1 1 0 1 0-1.414-1.414l-.707.707a1 1 0 0 0 .707 1.707zM5.636 16.95l-.707.707a1 1 0 1 0 1.414 1.414l.707-.707a1 1 0 0 0-1.414-1.414zm11.314 0a1 1 0 0 0 0 1.414l.707.707a1 1 0 0 0 1.414-1.414l-.707-.707a1 1 0 0 0-1.414 0zM5.636 7.05A1 1 0 0 0 7.05 5.636l-.707-.707a1 1 0 0 0-1.414 1.414z" fill="#d48319" stroke="none"/></svg>
				{:else}
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 128 128"><path d="M77.849 82.92a32.765 32.765 0 0 1-17.59-60.411 41.663 41.663 0 1 0 45.232 45.232A32.736 32.736 0 0 1 77.849 82.92z" fill="#ffc82c" stroke="none"/></svg>
				{/if}
			</button>
		</div>
	</div>
</nav>

<main class="container">
	{@render children()}
</main>

<footer>
	<div class="shoutouts">
		<p>Powered by <a href="https://vertexlab.io">Vertex</a></p>
		<p class="separator">•</p>
		<p>Designed by <a href="/npub1t3gd5yefglarhar4n6uh34uymvft4tgu8edk5465zzhtv4rrnd9sg7upxq">Vlad</a></p>
	</div>
</footer>

<style>
	.topnav {
		position: sticky;
		top: 0;
		z-index: 100;
		transition: opacity 0.1s ease;
	}

	.topnav-inner {
		max-width: 500px;
		margin: 0 auto;
		padding: 0 1rem;
		height: 52px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.nav-links {
		display: flex;
		gap: 1.5rem;
		align-items: center;
	}

	.nav-links a {
		font-size: 0.9rem;
		color: var(--secondary-text);
		text-decoration: none;
		transition: color 0.15s;
	}

	.nav-links a:hover,
	.nav-links a.active {
		color: var(--primary-text);
	}

	.icon-link {
		display: flex;
		align-items: center;
		color: var(--secondary-text);
		transition: color 0.15s;
	}

	.icon-link:hover {
		color: var(--primary-text);
	}

	.theme-toggle {
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
	}

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
</style>
