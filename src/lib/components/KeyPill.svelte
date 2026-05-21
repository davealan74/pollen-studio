<script lang="ts">
  import { keyStore, disconnect } from '$stores/key.svelte';
  let open = $state(false);
  let wrap: HTMLDivElement | undefined = $state();
  const budgetLabel = $derived.by(() => {
    if (!keyStore.budget) return '';
    const days = Math.max(0, Math.round((keyStore.budget.expiresAt - Date.now()) / 86_400_000));
    return `${keyStore.budget.used}/${keyStore.budget.cap} · ${days}d`;
  });

  function onWindowPointerDown(e: PointerEvent) {
    if (!open || !wrap) return;
    if (!wrap.contains(e.target as Node)) open = false;
  }
</script>

<svelte:window onpointerdown={onWindowPointerDown} />

{#if keyStore.key}
  <div class="pill-wrap" bind:this={wrap}>
    <button class="pill" onclick={() => (open = !open)}>
      connected{#if budgetLabel}
        · {budgetLabel}{/if}
    </button>
    {#if open}
      <div class="drawer" role="menu">
        <a href="/auth/start" role="menuitem">Re-authorize…</a>
        <button
          role="menuitem"
          onclick={() => {
            disconnect();
            open = false;
          }}>Disconnect</button
        >
      </div>
    {/if}
  </div>
{/if}

<style>
  .pill-wrap {
    position: relative;
  }
  .pill {
    background: transparent;
    color: var(--accent);
    border: 1px solid var(--accent);
    border-radius: 999px;
    padding: 6px 12px;
    font-size: 13px;
    cursor: pointer;
  }
  .drawer {
    position: absolute;
    right: 0;
    top: 100%;
    margin-top: 8px;
    background: #1a1a22;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 160px;
    z-index: 10;
  }
  .drawer a,
  .drawer button {
    background: none;
    border: 0;
    color: var(--fg);
    text-align: left;
    padding: 6px 8px;
    border-radius: 6px;
    text-decoration: none;
    cursor: pointer;
  }
  .drawer a:hover,
  .drawer button:hover {
    background: #2a2a32;
  }
</style>
