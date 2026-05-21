<script lang="ts">
  import RunCard from './RunCard.svelte';
  import type { CellState } from '../../routes/compare/matrix';

  interface Props {
    cells: CellState[];
    surface: 'image' | 'text' | 'audio';
    onRetry?: (i: number) => void;
  }
  let { cells, surface, onRetry }: Props = $props();
</script>

<div class="grid">
  {#each cells as c, i (i)}
    <RunCard
      kind={surface}
      blob={c.blob}
      text={c.text}
      status={c.status}
      error={c.error}
      starred={c.starred}
      onFork={() => onRetry?.(i)}
    />
  {/each}
</div>

<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 12px;
  }
</style>
