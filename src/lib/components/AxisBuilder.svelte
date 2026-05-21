<script lang="ts">
  import { modelsFor } from '$pollinations/models';
  import type { Surface } from '$pollinations/models';
  import type { Axes } from '../../routes/compare/matrix';

  interface Props {
    surface: Surface;
    axes: Axes;
  }
  let { surface, axes = $bindable() }: Props = $props();

  const allModels = $derived(modelsFor(surface));

  function toggleModel(id: string) {
    axes.models = axes.models.includes(id)
      ? axes.models.filter((m) => m !== id)
      : [...axes.models, id];
  }
  function setSeeds(n: number) {
    axes.seeds = Array.from({ length: n }, (_, i) => i + 1);
  }
  function toggleSize(s: string) {
    axes.sizes = (axes.sizes ?? []).includes(s)
      ? (axes.sizes ?? []).filter((x) => x !== s)
      : [...(axes.sizes ?? []), s];
  }
</script>

<div class="builder">
  <div class="row">
    <span class="row-label">Models</span>
    <div class="chips">
      {#each allModels as m}
        <button class:active={axes.models.includes(m.id)} onclick={() => toggleModel(m.id)}
          >{m.label}</button
        >
      {/each}
    </div>
  </div>
  <div class="row">
    <span class="row-label">Seeds</span>
    <div class="chips">
      {#each [1, 3, 5] as n}
        <button class:active={axes.seeds.length === n} onclick={() => setSeeds(n)}>{n}</button>
      {/each}
    </div>
  </div>
  {#if surface === 'image'}
    <div class="row">
      <span class="row-label">Sizes</span>
      <div class="chips">
        {#each ['512x512', '768x768', '1024x1024', '1024x576', '576x1024'] as s}
          <button class:active={(axes.sizes ?? []).includes(s)} onclick={() => toggleSize(s)}
            >{s}</button
          >
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .builder {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
    background: #14141a;
    border: 1px solid var(--border);
    border-radius: var(--radius);
  }
  .row {
    display: grid;
    grid-template-columns: 100px 1fr;
    align-items: center;
    gap: 16px;
  }
  .row-label {
    color: var(--muted);
    font-size: 13px;
  }
  .chips {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }
  .chips button {
    background: #1a1a22;
    border: 1px solid var(--border);
    color: var(--fg);
    padding: 6px 10px;
    border-radius: 999px;
    cursor: pointer;
    font-size: 13px;
  }
  .chips button.active {
    border-color: var(--accent);
    color: var(--accent);
  }
</style>
