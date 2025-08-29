<script>
    import { onEnter, onEsc } from "$lib/events";
    import { onDestroy, onMount } from "svelte";
    import { browser } from "$app/environment";

    import ProfilePicture from "$lib/components/ProfilePicture.svelte";
    import { on } from "svelte/events";

    const { picture, pictureURL, size } = $props();

    let showPicture = $state(false);
    let isMobile = $state(false);

    function openPicture() { showPicture = true; }
    function closePicture() { showPicture = false; }
    function checkIfMobile() { isMobile = window.innerWidth <= 576 }

    onMount(() => { 
        if (browser) {
            checkIfMobile()
            window.addEventListener("resize", checkIfMobile);
            document.addEventListener('keydown', onEsc(closePicture))
        }
    });

    onDestroy(() => { 
        if (browser) {
            window.removeEventListener("resize", checkIfMobile);
            document.removeEventListener('keydown', onEsc(closePicture)) 
        }
    });
</script>

<button onclick={openPicture} aria-label="View profile picture">
    <ProfilePicture source={picture} size={ isMobile ? "130px" : "100px" } />
</button>

{#if showPicture}
    <div class="picture-overlay"
        role="button"
        onclick={closePicture}
        tabindex="0"
        onkeydown={onEnter(closePicture)}
        aria-label="Close image"
    >
        <div class="picture-container" 
            role="cell"
            onclick={(e) => e.stopPropagation()}
            tabindex="0"
            onkeydown={(e) => {}}
        >
            <img src={pictureURL} alt="Full Profile" />
            <button class="close-button" onclick={closePicture} aria-label="Close image">✕</button>
        </div>
    </div>
{/if}

<style>
    @import "../../../static/shared.css";

    button {
        all: unset;
        cursor: pointer;
    }

    .picture-overlay {
        position: fixed;
        inset: 0;
        background: var(--overlay-color);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 999;
    }

    .picture-container {
        position: relative;
        text-align: center;
    }

    .picture-container img {
        height: 100vh;
        width: auto;
    }

    .close-button {
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: var(--background-color);
        color: var(--primary-text);
        border: none;
        border-radius: 50%;
        width: 2rem;
        height: 2rem;
        line-height: 2rem;  /* vertical alignment*/
        font-size: 1.2rem;
        padding: 0;
        cursor: pointer;
        z-index: 10;
    }

    @media (max-width: 576px) {
        .picture-container img {
            height: auto;
            width: 100vw;
        }
    }
</style>