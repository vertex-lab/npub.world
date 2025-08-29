<script>
    import { onMount, onDestroy } from "svelte";
    import { browser } from "$app/environment";

    import ProfilePicture from "$lib/components/ProfilePicture.svelte";
    import CopyLink from "$lib/components/CopyLink.svelte";
    import ReputationBadge from "$lib/components/ReputationBadge.svelte";
    import FollowList from "./FollowList.svelte";
    import PressableProfilePicture from "$lib/components/PressableProfilePicture.svelte";

    const { profile } = $props();

    let isMobile = $state(false);
    function checkIfMobile() { isMobile = window.innerWidth < 576 }

    onMount(() => { 
        if (browser) {
            checkIfMobile()
            window.addEventListener("resize", checkIfMobile);
        }
    });

    onDestroy(() => { 
        if (browser) {
            window.removeEventListener("resize", checkIfMobile);
        }
    });
</script>

<div class="profile-header">
    <PressableProfilePicture 
        picture={profile.picture} 
        pictureURL={profile.pictureURL} 
        size={ isMobile ? "130px" : "100px" } 
    />

    <div class="copy-link">
        <CopyLink/>
    </div>

    <div class="profile-identity">
        <p class="profile-name">
            {profile.name}
            <ReputationBadge reputation={profile.reputation} tooltip={isMobile ? false : true } size={22}/>
        </p>

        <p class="profile-nip05">
            {profile.nip05}
        </p>

        <div class="profile-stats">
            <FollowList label="Following" count={profile.follows} npub={profile.npub} action="?/follows"/>
            <FollowList label="Followers" count={profile.followers} npub={profile.npub} action="?/followers"/>
        </div>
    </div>
</div>

<style>
@import "../../../static/shared.css";
    .profile-header {
        position: relative;
        display: flex;
        align-items: flex-start;
        margin-bottom: 1.5rem;
        padding-bottom: 1.5rem;
        margin: 0 auto 1.5rem;
        border-bottom: 1px solid var(--border-color);
    }

    .copy-link {
        position: absolute;
        top: 1rem;
        right: 1rem;
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
        display: flex;
        gap: 1rem;
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

        .copy-link {
            top: 0;
            right: 0;
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
    }
</style>