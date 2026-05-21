<script lang="ts">
  import { totalCost } from '$pollinations/pricing';
  interface Props {
    cells: Parameters<typeof totalCost>[0];
  }
  let { cells }: Props = $props();
  const cost = $derived(totalCost(cells));
  const withSurcharge = $derived(Math.round(cost * 1.25 * 100) / 100);
</script>

<div class="strip">
  <span>{cells.length} cell{cells.length === 1 ? '' : 's'}</span>
  <span>~ {cost.toFixed(2)} pollen · +25% = <strong>{withSurcharge.toFixed(2)}</strong></span>
</div>

<style>
  .strip {
    display: flex;
    justify-content: space-between;
    padding: 8px 12px;
    background: #1a1a22;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    font-size: 13px;
    color: var(--muted);
  }
  strong {
    color: var(--fg);
  }
</style>
