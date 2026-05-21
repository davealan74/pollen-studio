<script lang="ts">
  import { runs } from '$stores/runs.svelte';
  interface Props {
    onPick?: (id: string) => void;
  }
  let { onPick }: Props = $props();
</script>

<aside class="rail">
  <h3>History</h3>
  {#if runs.items.length === 0}
    <p class="empty">No runs yet.</p>
  {/if}
  {#each runs.items as r}
    <button class="row" onclick={() => onPick?.(r.id)}>
      <span class="when">{new Date(r.createdAt).toLocaleTimeString()}</span>
      <span class="surface">{r.surface}</span>
      <span class="prompt">{r.prompt.slice(0, 40)}</span>
    </button>
  {/each}
</aside>

<style>
  .rail {
    width: 260px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    border-right: 1px solid var(--border);
    padding: 16px;
    max-height: 70vh;
    overflow-y: auto;
  }
  h3 {
    margin: 0 0 8px 0;
    font-size: 13px;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .row {
    background: none;
    border: 0;
    color: var(--fg);
    padding: 6px 4px;
    text-align: left;
    cursor: pointer;
    display: grid;
    grid-template-columns: auto auto 1fr;
    gap: 8px;
    font-size: 13px;
    border-radius: 6px;
  }
  .row:hover {
    background: #1a1a22;
  }
  .when {
    color: var(--muted);
    font-family: var(--font-mono);
    font-size: 11px;
  }
  .surface {
    color: var(--accent);
  }
  .prompt {
    color: var(--fg);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .empty {
    color: var(--muted);
    font-size: 13px;
  }
</style>
