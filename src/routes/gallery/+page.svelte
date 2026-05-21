<script lang="ts">
  import { onMount } from 'svelte';
  import { runs, loadRuns, removeRun } from '$stores/runs.svelte';
  import { purgeOlderThan } from '$db/purge';
  import { showToast } from '$stores/toast.svelte';

  onMount(loadRuns);

  async function wipe() {
    if (!confirm('Wipe local history? This cannot be undone.')) return;
    for (const r of runs.items) await removeRun(r.id);
    showToast('Gallery wiped.', 'success');
  }
  async function purge() {
    const n = await purgeOlderThan(30);
    await loadRuns();
    showToast(`Purged ${n} runs older than 30 days.`, 'success');
  }
</script>

<section class="gallery">
  <header>
    <h1>Gallery</h1>
    <div class="actions">
      <button onclick={purge}>Purge older than 30 days</button>
      <button onclick={wipe}>Wipe local history</button>
    </div>
  </header>
  {#if !runs.loaded}
    <p>Loading…</p>
  {:else if runs.items.length === 0}
    <p>No runs yet.</p>
  {:else}
    <ul class="list">
      {#each runs.items as r}
        <li>
          <span class="when">{new Date(r.createdAt).toLocaleString()}</span>
          <span class="mode">{r.mode}</span>
          <span class="surface">{r.surface}</span>
          <span class="prompt">{r.prompt}</span>
          <button onclick={() => removeRun(r.id)}>Delete</button>
        </li>
      {/each}
    </ul>
  {/if}
</section>

<style>
  .gallery {
    max-width: 1080px;
    margin: 0 auto;
  }
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .actions {
    display: flex;
    gap: 8px;
  }
  .actions button {
    background: #1a1a22;
    border: 1px solid var(--border);
    color: var(--fg);
    padding: 6px 12px;
    border-radius: var(--radius);
    cursor: pointer;
  }
  ul {
    list-style: none;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  li {
    display: grid;
    grid-template-columns: 160px 80px 60px 1fr auto;
    gap: 8px;
    padding: 8px;
    background: #14141a;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    align-items: center;
  }
  .when {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--muted);
  }
  .surface {
    color: var(--accent);
    font-size: 12px;
  }
  .prompt {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  li button {
    background: none;
    border: 1px solid var(--border);
    color: var(--muted);
    padding: 4px 8px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
  }
</style>
