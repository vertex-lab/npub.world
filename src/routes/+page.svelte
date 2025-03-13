<script>
  import SearchBox from "$lib/components/SearchBox.svelte";
  let searchQuery = $state("");
  let { data } = $props();
</script>

<div class="container">
  <div class="logo-container">
    <img src="/logo.png" alt="logo" />
    <div class="logo-text">
      <span>NPUB</span>
      <span>.WORLD</span>
    </div>
  </div>

  <SearchBox query={searchQuery} {data} />
</div>

<style>
  .logo-container {
    display: flex;
    align-items: center;
    gap: 1rem;
    justify-content: center;
  }

  .logo-text {
    display: flex;
    flex-direction: column;
  }

  .logo-text span {
    font-size: 1.8rem;
    font-weight: bold;
    color: var(--primary-text);
    line-height: 1.1;
  }

  /* Responsive styles */
  /* Small screens (mobile) */
  @media (max-width: 576px) {
    .container {
      padding: 1rem;
      box-sizing: border-box;
    }

    .logo-text span {
      font-size: 1.4rem;
    }
  }

  /* Medium screens (tablet) */
  @media (min-width: 577px) and (max-width: 992px) {
    .container {
      padding: 1.5rem;
    }

    .logo-container {
      margin-bottom: 1rem;
    }

    .logo-text span {
      font-size: 1.6rem;
    }
  }

  /* Large screens (desktop) */
  @media (min-width: 993px) {
    .logo-container {
      margin-bottom: 2rem;
    }
  }
</style>
