<script>
    import { onMount, onDestroy } from "svelte";
    import { browser } from "$app/environment";

    import ProfilePicture from "$lib/components/ProfilePicture.svelte";
    import CopyLink from "$lib/components/CopyLink.svelte";
    import ReputationBadge from "$lib/components/ReputationBadge.svelte";
    import LeakBanner from "$lib/components/LeakBanner.svelte";
    import FollowList from "./FollowList.svelte";
    import PressableProfilePicture from "$lib/components/PressableProfilePicture.svelte";

    const { profile } = $props();
</script>

<div class="profile-header">
    <div class="profile-top">
        <PressableProfilePicture picture={profile.picture} pictureURL={profile.pictureURL} />

        <div class="profile-identity">
            <p class="profile-name">
                {profile.name}
                {#if !profile.leak}
                    <ReputationBadge reputation={profile.popularity} size={22}/>
                {/if}
            </p>

            <p class="profile-nip05">
                {profile.nip05}
            </p>

            <div class="profile-stats">
                <FollowList label="Following" count={profile.follows} npub={profile.npub} action="?/follows"/>
                <FollowList label="Followers" count={profile.followers} npub={profile.npub} action="?/followers"/>
            </div>
        </div>

        <div class="copy-link">
            <CopyLink/>
        </div>
    </div>

    {#if profile.leak}
        <LeakBanner leak={profile.leak} />
    {/if}
</div>

<style>
    .profile-header {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding-bottom: 1.5rem;
        border-bottom: 1px solid var(--border-color);
    }

    .profile-top {
        position: relative;
        display: flex;
        align-items: flex-start;
    }

    .copy-link {
        position: absolute;
        top: 0;
        right: 0;
    }

    .profile-identity {
        text-align: left;
        width: 100%;
        margin-right: calc(1rem + 90px); /* account for copy link button */
        flex-grow: 1;
        overflow: hidden;
    }

    .profile-name {
        word-wrap: break-word;
        font-size: 1.5rem;
        font-weight: 600;
        margin: 0.5rem 0 0 0;
    }

    .profile-nip05 {
        font-size: 0.9rem;
        color: var(--light-text);
        max-width: 100%;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin: 0.75rem 0;
    }

    .profile-stats {
        display: flex;
        gap: 1rem;
        margin: 0 0 0.5rem 0;
    }

    /* Responsive styles */
    /* Small screens (mobile) */
    @media (max-width: 576px) {
        .profile-top {
            flex-direction: column;
            align-items: center;
            text-align: center;
        }

        .profile-identity {
            margin: 0 auto;
            text-align: center;
        }

        .profile-stats {
            flex-wrap: nowrap;
            justify-content: center;
            margin-bottom: 0.5rem;
        }
    }
</style>
