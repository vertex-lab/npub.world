<script>
    import ProfilePicture from "$lib/components/ProfilePicture.svelte";
    import ReputationBadge from "$lib/components/ReputationBadge.svelte";

    const { profile } = $props();
</script>

<div class="profile-header">
    <ProfilePicture source={profile.picture} size="100px"></ProfilePicture>
    <div class="profile-identity">
        <p class="profile-name">
            {profile.name}
            <ReputationBadge reputation={profile.reputation} tooltip=true size={22}/>
        </p>
        <p class="profile-handle">{profile.nip05}</p>
        <div class="profile-stats">
        <div class="stat-pair">
            <span>Following:</span><span class="stat">{profile.follows}</span>
        </div>
        <div class="stat-pair">
            <span>Followers:</span><span class="stat">{profile.followers}</span>
        </div>
        </div>
    </div>
</div>

<style>
@import "../../../static/shared.css";

    .profile-header {
        display: flex;
        align-items: flex-start;
        margin-bottom: 1.5rem;
        padding-bottom: 1.5rem;
        border-bottom: 1px solid var(--border-color);
    }

    .profile-identity {
        flex-grow: 1;
    }

    .profile-name {
        word-wrap: break-word;
        font-size: 1.5rem;
        font-weight: 600;
        margin-top: 1rem;
        margin-bottom: 0.2rem;
    }

    .profile-handle {
        font-size: 0.95rem;
        color: var(--light-text);
        margin: 0 0 12px 0;
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

        .profile-identity {
            margin-bottom: 1rem;
            text-align: center;
        }

        .profile-name {
            margin-top: 0.5rem;
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

    /* Medium screens (tablet) */
    @media (min-width: 577px) and (max-width: 992px) {
        .profile-header {
            flex-wrap: wrap;
        }

        .profile-identity {
             width: auto;
        }
    }
</style>