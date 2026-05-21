<script lang="ts">
  import PromptBox from '$components/PromptBox.svelte';
  import AxisBuilder from '$components/AxisBuilder.svelte';
  import MatrixGrid from '$components/MatrixGrid.svelte';
  import CostEstimate from '$components/CostEstimate.svelte';
  import KeyConnect from '$components/KeyConnect.svelte';
  import { keyStore } from '$stores/key.svelte';
  import { showToast } from '$stores/toast.svelte';
  import { handleAuthError } from '$pollinations/errors';
  import { expand, type Axes, type CellState } from './matrix';
  import { PollinationsClient } from '$pollinations/client';
  import { generateImage } from '$pollinations/image';
  import { generateText } from '$pollinations/text';
  import { generateAudio } from '$pollinations/audio';
  import type { CostInput } from '$pollinations/pricing';

  type SurfaceKind = 'image' | 'text' | 'audio';
  const SURFACES: SurfaceKind[] = ['image', 'text', 'audio'];

  let surface = $state<SurfaceKind>('image');
  let prompt = $state('');
  let axes = $state<Axes>({ models: ['flux'], seeds: [1, 2, 3] });
  let cells = $state<CellState[]>([]);
  let running = $state(false);

  const imageBase =
    (import.meta.env.VITE_POLLINATIONS_IMAGE_BASE as string) ?? 'https://image.pollinations.ai';
  const textBase =
    (import.meta.env.VITE_POLLINATIONS_TEXT_BASE as string) ?? 'https://text.pollinations.ai';
  const client = new PollinationsClient({ bases: { image: imageBase, text: textBase } });

  const specs = $derived(expand(axes));
  const costInputs = $derived<CostInput[]>(
    specs.map((s) =>
      surface === 'image'
        ? {
            surface: 'image' as const,
            model: s.model,
            width: 1024,
            height: 1024,
            quality: (s.quality as 'low' | 'medium' | 'high' | 'hd' | undefined) ?? 'high'
          }
        : surface === 'text'
          ? { surface: 'text' as const, model: s.model, maxTokens: 512 }
          : {
              surface: 'audio' as const,
              model: s.model,
              voice: s.voice ?? 'alloy'
            }
    )
  );

  async function generate() {
    if (!keyStore.key || !prompt.trim()) return;
    running = true;
    cells = specs.map((s) => ({ spec: s, status: 'pending' as const }));
    await Promise.all(
      specs.map(async (s, i) => {
        try {
          if (surface === 'image') {
            const [w, h] = (s.size ?? '1024x1024').split('x').map(Number);
            const blob = await generateImage(client, {
              prompt,
              model: s.model,
              width: w,
              height: h,
              quality: (s.quality as 'low' | 'medium' | 'high' | 'hd' | undefined) ?? 'high',
              enhance: false,
              seed: s.seed
            });
            cells[i] = { ...cells[i], status: 'ok', blob };
          } else if (surface === 'text') {
            const text = await generateText(client, {
              prompt,
              model: s.model,
              temperature: s.temperature ?? 0.7,
              maxTokens: 512
            });
            cells[i] = { ...cells[i], status: 'ok', text };
          } else {
            const blob = await generateAudio(client, {
              prompt,
              voice: s.voice ?? 'alloy'
            });
            cells[i] = { ...cells[i], status: 'ok', blob };
          }
        } catch (e) {
          cells[i] = { ...cells[i], status: 'error', error: (e as Error).message };
          if (!handleAuthError(e, { onToast: showToast })) showToast((e as Error).message, 'error');
        }
        cells = [...cells];
      })
    );
    running = false;
    showToast('Matrix complete.', 'success');
  }
</script>

<section class="compare">
  {#if !keyStore.key}<KeyConnect />{/if}
  <div class="surfaces">
    {#each SURFACES as s}
      <button class:active={surface === s} onclick={() => (surface = s)}>{s}</button>
    {/each}
  </div>
  <PromptBox
    bind:value={prompt}
    placeholder="The same prompt, run across every cell of the matrix."
  />
  <AxisBuilder {surface} bind:axes />
  <CostEstimate cells={costInputs} />
  <button
    class="run"
    onclick={generate}
    disabled={running || !keyStore.key || !prompt.trim() || specs.length === 0}
  >
    {running ? 'Running…' : `Generate Matrix (${specs.length})`}
  </button>
  <MatrixGrid {cells} {surface} />
</section>

<style>
  .compare {
    max-width: 1080px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .surfaces {
    display: flex;
    gap: 8px;
  }
  .surfaces button {
    background: #1a1a22;
    border: 1px solid var(--border);
    color: var(--fg);
    padding: 6px 14px;
    border-radius: var(--radius);
    cursor: pointer;
    text-transform: capitalize;
  }
  .surfaces button.active {
    border-color: var(--accent);
    color: var(--accent);
  }
  .run {
    background: var(--accent);
    color: #0f0f12;
    padding: 12px;
    border: 0;
    border-radius: var(--radius);
    font-weight: 600;
    cursor: pointer;
  }
  .run:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
