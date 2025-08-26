<script>
    import { onMount } from 'svelte';
    import { deserialize } from '$app/forms';

    import PressableProfile from '$lib/components/PressableProfile.svelte';

    export let label;   // "Followers" or "Following"
    export let count;   // Number to display
    export let npub;    // The npub of the profile
    export let action;  // The server action to perform on click
  
    let profiles = [];
    let error = '';

    let showModal = false;
    let isLoading = false;
    let currentNpub = npub;

    $: if (npub !== currentNpub) {
        profiles = [];
        currentNpub = npub;
    }

    async function doAction() {
        isLoading = true;
        error = '';

        const params = new FormData();
        params.set('npub', npub)
        params.set('limit', 100);

        let response = await fetch(
            action, {
            method: 'POST',
            body: params
        });

        response = deserialize(await response.text());
        if (response.data.error) {
            error = response.data.error
        } else {
            profiles = response.data;
            console.log(profiles);
        }

        isLoading = false;
    }

    async function openModal() {
        showModal = true;
        if (!profiles.length) {
            await doAction();
        }
    }

    function closeModal() { showModal = false; }
</script>

<button class="stat-pair" onclick={openModal}>
    <span>{label}:</span><span class="stat">{count}</span>
</button>

{#if showModal}
    <div class="modal-overlay"
        role="button"
        onclick={closeModal}
        tabindex="0"
        onkeydown={(e) => e.key === 'Enter' || e.key === ' ' ? closeModal() : null}
        aria-label="Close modal"
    >
        <div class="modal">
            <div class="modal-header">
                <p class="section-title">{label}</p>
                <button class="close-button" onclick={closeModal} aria-label="Close image">✕</button>
            </div>

            {#if isLoading}
                <p>Loading {label.toLowerCase()}...</p>
            {:else if error}
                <p>{error}</p>
            {:else if profiles.length === 0}
                <p>No {label.toLowerCase()} found.</p>
            {:else}
                {#each profiles as profile}
                    <PressableProfile profile={profile}/>
                {/each}
            {/if}
        </div>
    </div>
{/if}

<style>
    button {
        all: unset;
        cursor: pointer;
    }

    .stat-pair {
        display: flex;
        gap: 0.25rem;
    }

    .stat {
        font-weight: bold;
    }

    .modal-overlay {
        position: fixed;
        inset: 0;
        background: var(--overlay-color);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 999;
    }

    .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
        margin: 0;
    }

    .section-title {
        font-size: 1.25rem;
        font-weight: 500;
        color: var(--secondary-text);        
    }

    .modal {
        position: fixed;
        top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        background: var(--card-background);
        padding: 1rem;
        border-radius: 0.5rem;
        z-index: 11;
        width: 90%;
        max-width: 400px;
        max-height: 80vh;
        overflow-y: auto;
    }

    .close-button {
        color: var(--primary-text);
        font-size: 1.2rem;
        padding: 0;
        cursor: pointer;
        z-index: 10;
        background: none;
        border: none;
    }
</style>
