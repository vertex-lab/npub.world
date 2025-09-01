<script>
    import { deserialize } from '$app/forms';
    import { page } from '$app/stores';
    import { browser } from "$app/environment";
    import { onDestroy, onMount } from 'svelte';

    import { onEsc } from '$lib/events';
    import PressableProfile from '$lib/components/PressableProfile.svelte';

    // - npub of the user whose follow list is being displayed
    // - label is either "Followers" or "Following"
    // - count is the number to be displayed
    // - action is the server action to perform on click
    const { npub, label, count, action} = $props();
    const formatter = new Intl.NumberFormat('en-US');

    let profiles = $state([]);
    let error = $state('');
    let showModal = $state(false);
    let isLoading = $state(false);

    function closeModal() { showModal = false; }

    async function openModal() {
        showModal = true;
        if (count !== 0 && !profiles.length) {
            await doAction();
        }
    }

    async function doAction() {
        isLoading = true;
        error = '';

        const params = new FormData();
        params.set('npub', npub);
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
        }

        isLoading = false;
    }

    onMount(() => { if (browser) document.addEventListener('keydown', onEsc(closeModal)) });
    onDestroy(() => { if (browser) document.removeEventListener('keydown', onEsc(closeModal)) });

    // refresh when page updates
    $effect(() => { 
        if ($page.url.href) {
            profiles = [];
            error = '';
            showModal = false;
            isLoading = false;
        }
    });

</script>

<button class="stat-pair" onclick={openModal}>
    <span>{label}:</span><span class="stat">{formatter.format(count)}</span>
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
                <p class="modal-message">Loading {label.toLowerCase()}...</p>
            {:else if error}
                <p class="modal-message">{error}</p>
            {:else if profiles.length === 0}
                <p class="modal-message">No {label.toLowerCase()} found.</p>
            {:else}
                {#each profiles as profile}
                    <PressableProfile profile={profile} preload="tap"/>
                {/each}

                {#if count > profiles.length}
                    <p class="modal-message" style="margin-top: 20px">And { formatter.format(count - profiles.length) } others</p>
                {/if}
            {/if}
        </div>
    </div>
{/if}

<style>
    @import "../../../static/shared.css";

    button {
        all: unset;
        cursor: pointer;
    }

    .stat-pair {
        color: var(--secondary-text);
        font-size: 0.9rem;
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
        margin-bottom: 1rem;
    }

    .section-title {
        margin: 10px;
        font-size: 1.25rem;
        font-weight: 500;
        color: var(--secondary-text);        
    }

    .modal {
        position: relative;
        background: var(--card-background);
        box-shadow: var(--shadow-elevation-modal);
        text-align: left;
        padding: 1rem;
        border-radius: 12px;
        z-index: 11;
        width: 80%;
        max-width: 400px;
        max-height: 80vh;
        overflow-y: auto;
    }

    .modal-message {
        margin: 10px;
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
