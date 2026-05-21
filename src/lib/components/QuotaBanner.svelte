<script lang="ts">
  import { onMount } from 'svelte';
  import { quotaSnapshot, purgeOlderThan, QUOTA_WARN_RATIO } from '$db/purge';
  import { loadRuns } from '$stores/runs.svelte';
  import { showToast } from '$stores/toast.svelte';

  let ratio = $state(0);
  let dismissed = $state(false);

  onMount(async () => {
    const snap = await quotaSnapshot();
    if (snap) ratio = snap.ratio;
  });

  async function doPurge() {
    const n = await purgeOlderThan(30);
    await loadRuns();
    showToast(`Purged ${n} runs.`, 'success');
    dismissed = true;
  }
</script>

{#if !dismissed && ratio >= QUOTA_WARN_RATIO}
  <div class="banner">
    Local storage is {Math.round(ratio * 100)}% full.
    <button onclick={doPurge}>Purge older than 30 days</button>
    <button onclick={() => (dismissed = true)}>Dismiss</button>
  </div>
{/if}

<style>
  .banner {
    background: #2a1f10;
    border-bottom: 1px solid var(--accent);
    padding: 10px 16px;
    font-size: 13px;
    display: flex;
    gap: 12px;
    align-items: center;
  }
  button {
    background: transparent;
    border: 1px solid var(--accent);
    color: var(--accent);
    padding: 4px 10px;
    border-radius: 6px;
    cursor: pointer;
  }
</style>
