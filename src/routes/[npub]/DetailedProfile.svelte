<script>
  import ProfileHeader from '$lib/components/ProfileHeader.svelte';
  import CopyLink from '$lib/components/CopyLink.svelte';
  import ReputationBadge from '$lib/components/ReputationBadge.svelte';
  import CompromisedBanner from '$lib/components/CompromisedBanner.svelte';
  import FollowList from './FollowList.svelte';

  const { profile } = $props();
</script>

<ProfileHeader {profile}>
  {#snippet name()}
    {profile.name}
    {#if !profile.compromised}
      <ReputationBadge reputation={profile.popularity} size={22}/>
    {/if}
  {/snippet}

  {#snippet action()}
    <CopyLink />
  {/snippet}

  {#snippet stats()}
    <div class="profile-stats">
      <FollowList label="Following" count={profile.stats.follows} npub={profile.npub} action="?/follows"/>
      <FollowList label="Followers" count={profile.stats.followers} npub={profile.npub} action="?/followers"/>
    </div>
  {/snippet}

  {#snippet banner()}
    {#if profile.compromise}
      <CompromisedBanner compromise={profile.compromise} />
    {/if}
  {/snippet}
</ProfileHeader>

<style>
  .profile-stats {
    display: flex;
    gap: 1rem;
  }

  @media (max-width: 576px) {
    .profile-stats {
      flex-wrap: nowrap;
      justify-content: center;
    }
  }
</style>
