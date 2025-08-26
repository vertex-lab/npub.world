<script>
    import { onMount, onDestroy } from "svelte";
    import { browser } from "$app/environment";
    import ProfilePicture from "$lib/components/ProfilePicture.svelte";
    import ReputationBadge from "$lib/components/ReputationBadge.svelte";
    import ProfilesModal from "./FollowList.svelte";
    import FollowList from "./FollowList.svelte";

    const { profile } = $props();
    let showPicture = $state(false);
    let showFollow = $state(false);
    let isMobile = $state(false);

    function openPicture() { showPicture = true; }
    function closePicture() { showPicture = false; }
    function checkIfMobile() { isMobile = window.innerWidth <= 576 }

    function escClosePicture(e) {
        if (e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27) closePicture()
    }

    onMount(() => { 
        if (browser) {
            checkIfMobile()
            window.addEventListener("resize", checkIfMobile);
            window.addEventListener('keydown', escClosePicture)
        }
    });

    onDestroy(() => { 
        if (browser) {
            window.removeEventListener("resize", checkIfMobile);
            window.removeEventListener('keydown', escClosePicture) 
        }
    });
</script>

<div class="profile-header">
    <button onclick={openPicture} aria-label="View profile picture">
        <ProfilePicture source={profile.picture} size={ isMobile ? "130px" : "100px" } />
    </button>

    <div class="profile-identity">
        <p class="profile-name">
            {profile.name}
            <ReputationBadge reputation={profile.reputation} tooltip={isMobile ? false : true } size={22}/>
        </p>
        <p class="profile-nip05">{profile.nip05}</p>
        <div class="profile-stats">
        <div class="stat-pair">
            <span>Following:</span><span class="stat">{profile.follows}</span>
        </div>
        <!-- <form method="POST" action="?/followers">
            <button type="submit" name="followers" class="stat-pair">
                <span>Followers:</span><span class="stat">{profile.followers}</span>
            </button>
        </form> -->

        {#key profile.npub}
            <FollowList
            label="Followers"
            count={profile.followers}
            action="?/followers"
            />
        {/key}

        </div>
    </div>

    {#if showPicture}
    <div class="picture-overlay"
        role="button"
        onclick={closePicture}
        tabindex="0"
        onkeydown={(e) => e.key === 'Enter' || e.key === ' ' ? closePicture() : null}
        aria-label="Close image"
    >
        <div class="picture-container" 
            role="cell"
            onclick={(e) => e.stopPropagation()}
            tabindex="0"
            onkeydown={(e) => e.key === 'Escape' || e.key === ' ' ? closePicture() : null}
        >
            <img src={profile.pictureURL} alt="Full Profile" />
            <button class="close-button" onclick={closePicture} aria-label="Close image">✕</button>
        </div>
    </div>
    {/if}
</div>

<style>
@import "../../../static/shared.css";
    .profile-header {
        display: flex;
        align-items: flex-start;
        margin-bottom: 1.5rem;
        padding-bottom: 1.5rem;
        margin: 0 auto 1.5rem;
        border-bottom: 1px solid var(--border-color);
    }

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

    .profile-identity {
        width: 100%;
        margin: 0 auto;
        flex-grow: 1;
        min-width: 0;
        overflow: hidden;
    }

    .profile-name {
        word-wrap: break-word;
        font-size: 1.5rem;
        font-weight: 600;
        margin: 1rem auto 0;
        margin-bottom: 0.5rem;
    }

    .profile-nip05 {
        font-size: 0.95rem;
        color: var(--light-text);
        margin: 0 0 12px 0;
        max-width: 100%;   
        white-space: nowrap;
        overflow: hidden;       
        text-overflow: ellipsis;
    }

    .profile-stats {
        color: var(--secondary-text);
        font-size: 0.9rem;
        display: flex;
        gap: 1rem;
    }

    .stat-pair {
        display: flex;
        gap: 0.25rem;
    }

    .stat {
        font-weight: bold;
    }
    
    /* Responsive styles */
    /* Small screens (mobile) */
    @media (max-width: 576px) {
        .profile-header {
            flex-direction: column;
            align-items: center;
            text-align: center;
            padding-bottom: 0;
        }

        .picture-container img {
            width: 100vw;
            height: auto;
        }

        .profile-name {
            margin-top: 0.5rem;
            max-width: 17ch;
        }

        .profile-stats {
            flex-wrap: nowrap;
            justify-content: center;
            margin-bottom: 0.5rem;
        }

        .stat-pair {
            justify-content: center;
            margin-bottom: 0.5rem;
        }
    }
</style>