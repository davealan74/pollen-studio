<script lang="ts">
  import { totalCost } from '$pollinations/pricing';
  interface Props {
    cells: Parameters<typeof totalCost>[0];
  }
  let { cells }: Props = $props();
  const cost = $derived(totalCost(cells));
  const withSurcharge = $derived(cost * 1.25);
  // Pollinations rates run from 0.001 to a few tenths of a pollen; 4 decimals
  // keeps cheap matrices from collapsing to "0.00 pollen" while staying readable.
  const fmt = (n: number) => (n >= 1 ? n.toFixed(2) : n.toFixed(4));
</script>

<div class="strip">
  <span>{cells.length} cell{cells.length === 1 ? '' : 's'}</span>
  <span>~ {fmt(cost)} pollen · +25% = <strong>{fmt(withSurcharge)}</strong></span>
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
