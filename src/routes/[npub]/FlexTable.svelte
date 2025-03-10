<script>
  import CopyText from "./copy.svelte";

  const { profile } = $props();
</script>

<table>
  <tbody>
    <tr>
      <td class="cell-left">Nostr Public Key:</td>
      <td
        ><CopyText
          text={profile.npub}
          color="#4a63b8"
          backgroundColor="#eef3ff"
        /></td
      >
    </tr>
    <tr>
      <td class="cell-left">Lightning Address:</td>
      <td
        ><CopyText
          text={profile.lud16}
          backgroundColor="#fff8e1"
          color="#b45309"
        /></td
      >
    </tr>
    <tr>
      <td class="cell-left">Bio:</td>
      <td class="bio-value">{@html profile.about}</td>
    </tr>
  </tbody>
</table>

<style>
  /* .flex-table {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .detail-row {
    display: flex;
    padding: 8px 0;
    width: 100%;
    overflow: hidden;
  }

  .detail-label {
    flex: 0 0 auto;
    font-weight: 500;
    color: var(--secondary-text);

    padding-right: 1em;

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .detail-value {
    flex: 1;

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  } */

  table {
    width: 100%;
    border-collapse: collapse;
  }

  td {
    overflow: hidden;
    text-overflow: ellipsis;
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
  }
</style>
