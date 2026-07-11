<script>
	import { page } from "$app/stores";
	import { onMount } from "svelte";

	let { children, data } = $props();

	let scrollY = $state(0);
	const navOpacity = $derived(Math.max(0, 1 - scrollY / 40));

	onMount(() => {
		const onScroll = () => scrollY = window.scrollY;
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	});
</script>

<nav class="topnav" style="opacity: {navOpacity}; pointer-events: {navOpacity < 0.1 ? 'none' : 'auto'}">
	<div class="topnav-inner">
		<div class="nav-links">
			<a href="/" class:active={$page.url.pathname === '/'}>Search</a>
			<a href="/discover" class:active={$page.url.pathname === '/discover'}>Discover</a>
			<a href="/stats" class:active={$page.url.pathname === '/stats'}>Stats</a>
			<a href="/settings" class="icon-link" class:active={$page.url.pathname === '/settings'} aria-label="Settings">
				{#if data.user?.picture}
					<img class="nav-pfp" src={data.user.picture} alt={data.user.name} />
				{:else}
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
						<path d="M17.925 20.056a6 6 0 0 0-11.851.001"/>
						<circle cx="12" cy="11" r="4"/>
						<circle cx="12" cy="12" r="10"/>
					</svg>
				{/if}
			</a>
		</div>
	</div>
</nav>

<main class="container">
	{@render children()}
</main>

<footer>
	<div class="shoutouts">
		<a href="/npub176p7sup477k5738qhxx0hk2n0cty2k5je5uvalzvkvwmw4tltmeqw7vgup" class="shoutout">Built by Pip</a>
		<p class="separator">•</p>
		<a href="/npub1t3gd5yefglarhar4n6uh34uymvft4tgu8edk5465zzhtv4rrnd9sg7upxq" class="shoutout">Designed by Vlad</a>
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
		font-size: var(--font-body);
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

	.nav-pfp {
		width: 24px;
		height: 24px;
		border-radius: 50%;
		object-fit: cover;
	}

	footer {
		padding-bottom: 2rem;
	}

	.shoutouts {
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: var(--font-caption);
		color: var(--secondary-text);
		margin: 0rem auto;
		height: 1rem;
	}

	.separator {
		margin: 0 0.5rem;
	}

	.shoutout {
		color: var(--secondary-text);
		text-decoration: none;
	}
</style>
