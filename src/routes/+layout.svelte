<script lang="ts">
  import '../app.css';
  import { page } from '$app/stores';
  import Footer from '$components/Footer.svelte';
  import Toast from '$components/Toast.svelte';
  import { keyStore } from '$stores/key.svelte';

  let { children } = $props();

  const modes = [
    { href: '/simple', label: 'Simple' },
    { href: '/compare', label: 'Compare' },
    { href: '/advanced', label: 'Advanced' }
  ];
</script>

<header>
  <a class="brand" href="/">Pollen Studio</a>
  <nav class="modes">
    {#each modes as m}
      <a
        href={m.href}
        class:active={$page.url.pathname === m.href || $page.url.pathname.startsWith(m.href + '/')}
        >{m.label}</a
      >
    {/each}
  </nav>
  <div class="key">
    {#if keyStore.key}
      {#await import('$components/KeyPill.svelte') then m}
        <m.default />
      {/await}
    {:else}
      <a href="/auth/start" class="pill">Connect</a>
    {/if}
  </div>
</header>

<main>{@render children()}</main>
<Footer />
<Toast />

<style>
  header {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 24px;
    align-items: center;
    padding: 16px 32px;
    border-bottom: 1px solid var(--border);
  }
  .brand {
    font-weight: 600;
    text-decoration: none;
  }
  .modes {
    display: flex;
    gap: 16px;
    justify-content: center;
  }
  .modes a {
    color: var(--muted);
    text-decoration: none;
    padding: 6px 10px;
    border-radius: var(--radius);
  }
  .modes a.active {
    color: var(--fg);
    background: #1a1a22;
  }
  .pill {
    padding: 6px 12px;
    border: 1px solid var(--border);
    border-radius: 999px;
    text-decoration: none;
    font-size: 13px;
  }
  main {
    min-height: calc(100vh - 130px);
    padding: 32px;
  }
</style>
