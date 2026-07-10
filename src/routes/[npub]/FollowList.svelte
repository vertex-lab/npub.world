<script>
    import { deserialize } from '$app/forms';
    import { page } from '$app/stores';
    import { browser } from "$app/environment";
    import { onDestroy, onMount } from 'svelte';

    import Modal from '$lib/components/Modal.svelte';
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
    <Modal title={label} onclose={closeModal}>
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
    </Modal>
{/if}

<style>
    button {
        all: unset;
        cursor: pointer;
    }

    .stat-pair {
        color: var(--secondary-text);
        font-size: var(--font-body);
        display: flex;
        gap: 0.25rem;
    }

    .stat {
        font-weight: bold;
    }

    .modal-message {
        margin: 10px;
    }
</style>
