<script>
  import { isValidURL } from "$lib/string";
  import CopyPill from "$lib/components/CopyPill.svelte";
  
  const { profile } = $props();
</script>

<table>
  <tbody>
    {#if profile.npub}
      <tr>
        <td class="cell-left">Nostr Public Key:</td>
        <td>
          <CopyPill
            text={profile.npub}
            color="var(--blueAccentText)"
            backgroundColor="var(--blueAccent)"/>
          </td>
      </tr>
    {/if}

    {#if profile.lud16}
      <tr>
        <td class="cell-left">Lightning Address:</td>
        <td>
          <CopyPill
            text={profile.lud16}
            color=var(--yellowAccentText)
            backgroundColor=var(--yellowAccent)/>
        </td>
      </tr>
    {/if}

    {#if profile.about}
      <tr style="vertical-align: top">
        <td class="cell-left"><p>Bio:</p></td>
        <td class="bio-value">{@html profile.about}</td>
      </tr>
    {/if}

    {#if profile.website}
      <tr>
        <td class="cell-left"><p>Website:</p></td>

        {#if isValidURL(profile.website)}
          <td>
            <a href={profile.website} target="_blank" rel="noopener noreferrer">{new URL(profile.website).host}</a>
          </td>
        {:else}
          <!-- show as plain text if invalid -->
          <td>{profile.website}</td>  
        {/if}
      </tr>
    {/if}

  </tbody>
</table>

<style>
  @import "../../../static/shared.css";

  table {
    width: 100%;
    border-collapse: collapse;
  }

  td {
    overflow: hidden;
    text-overflow: ellipsis;
    height: 3.5rem;
  }

  .cell-left {
    white-space: nowrap;
    width: 1%; /* Forces minimum needed width based on content */
    padding-right: 1em;
    height: 3.5rem;
  }

  .bio-value {
    color: var(--secondary-text);
    line-height: 1.5;
    overflow: auto;
    max-width: 100%;

    overflow-wrap: break-word;
    word-break: break-word;
    white-space: normal;
  }

  @media (max-width: 576px) {
    .cell-left {
      display: none;
    }
  }
</style>
