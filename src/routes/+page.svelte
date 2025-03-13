<script>
  import SearchBox from '$lib/components/SearchBox.svelte';
  import { page } from '$app/stores';
  import { onMount, afterUpdate } from 'svelte';
  
  export let data;
  let loading = false;
  let searchQuery = '';
  let prevData = null;

  onMount(() => {
    searchQuery = $page.url.searchParams.get('q') || '';
  });

  page.subscribe(value => {
    searchQuery = value.url.searchParams.get('q') || '';
  });

  function handleSubmit() {
    loading = true;
  }
  
  // Update loading state when data changes
  afterUpdate(() => {
    if (data !== prevData) {
      loading = false;
      prevData = data;
    }
  });
</script>

<div class="container">
  <div class="logo-container">
    <img src="/logo.png" alt="logo" />
    <div class="logo-text">
      <span>NPUB</span>
      <span>.WORLD</span>
    </div>
  </div>

  <div class="search-wrapper">
    <SearchBox 
      results={data.data || []} 
      {loading}
      onSubmit={handleSubmit}
      query={searchQuery}
    />
    {#if !data.data && data.error}
      <p class="error">{data.error}</p>
    {/if}
  </div>
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
  
  .search-wrapper {
    margin: 0 auto;
    width: 90%;
    max-width: 550px;
  }
  
  .error {
    color: var(--error-color);
    text-align: center;
    margin-top: 1rem;
  }

  /* Responsive styles */
  /* Small screens (mobile) */
  @media (max-width: 576px) {
    .container {
      padding: 1rem;
      box-sizing: border-box;
    }

    .header {
      gap: 1rem;
    }

    .logo-text span {
      font-size: 1.4rem;
    }

    .search-wrapper {
      width: 90%;
      max-width: 320px;
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

    .search-wrapper {
      width: 75%;
      max-width: 500px;
    }
  }

  /* Large screens (desktop) */
  @media (min-width: 993px) {
    .logo-container {
      margin-bottom: 2rem;
    }
  }
</style>