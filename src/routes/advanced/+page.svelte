<script lang="ts">
  import { onMount } from 'svelte';
  import HistoryRail from '$components/HistoryRail.svelte';
  import JsonInspector from '$components/JsonInspector.svelte';
  import CopyAs from '$components/CopyAs.svelte';
  import PromptBox from '$components/PromptBox.svelte';
  import RunCard from '$components/RunCard.svelte';
  import KeyConnect from '$components/KeyConnect.svelte';
  import { keyStore } from '$stores/key.svelte';
  import { loadRuns, saveRun } from '$stores/runs.svelte';
  import { showToast } from '$stores/toast.svelte';
  import { PollinationsClient } from '$pollinations/client';
  import { generateImage } from '$pollinations/image';
  import { newId } from '$utils/ulid';

  let surface = $state<'image' | 'text' | 'audio'>('image');
  let prompt = $state('');
  let model = $state('flux');
  let width = $state(1024);
  let height = $state(1024);
  let quality = $state<'low' | 'medium' | 'high' | 'hd'>('high');
  let seed = $state(-1);
  let enhance = $state(false);

  let lastRequest = $state<{ method: string; url: string; body?: unknown } | null>(null);
  let lastResponse = $state<{
    status: number;
    headers: Record<string, string>;
    bodyKind?: string;
  } | null>(null);
  let blob = $state<Blob | null>(null);
  let busy = $state(false);

  const base = (import.meta.env.VITE_POLLINATIONS_BASE as string) ?? 'https://pollinations.ai';
  const client = new PollinationsClient({ base });

  onMount(() => {
    loadRuns();
  });

  async function run() {
    if (!keyStore.key || !prompt.trim()) return;
    busy = true;
    const qs = new URLSearchParams({
      model,
      width: String(width),
      height: String(height),
      quality,
      enhance: String(enhance),
      seed: String(seed),
      nologo: 'true'
    });
    const url = `${base}/image/${encodeURIComponent(prompt)}?${qs}`;
    lastRequest = { method: 'GET', url };
    try {
      blob = await generateImage(client, { prompt, model, width, height, quality, enhance, seed });
      lastResponse = {
        status: 200,
        headers: { 'content-type': blob.type },
        bodyKind: 'blob (image)'
      };
      await saveRun({
        id: newId(),
        createdAt: Date.now(),
        surface,
        mode: 'advanced',
        prompt,
        request: { model, width, height, quality, enhance, seed },
        cells: []
      });
    } catch (e) {
      showToast((e as Error).message, 'error');
    } finally {
      busy = false;
    }
  }
</script>

<section class="advanced">
  <HistoryRail onPick={(id) => showToast(`reload ${id}`, 'info')} />
  <div class="editor">
    {#if !keyStore.key}<KeyConnect />{/if}
    <PromptBox bind:value={prompt} />
    <div class="params">
      <label>Model <input bind:value={model} /></label>
      <label>Width <input type="number" bind:value={width} /></label>
      <label>Height <input type="number" bind:value={height} /></label>
      <label
        >Quality
        <select bind:value={quality}>
          {#each ['low', 'medium', 'high', 'hd'] as q}<option>{q}</option>{/each}
        </select>
      </label>
      <label>Seed <input type="number" bind:value={seed} /></label>
      <label><input type="checkbox" bind:checked={enhance} /> enhance</label>
    </div>
    <button onclick={run} disabled={busy || !keyStore.key}>Run</button>
  </div>
  <div class="inspect">
    <RunCard kind="image" {blob} status={busy ? 'pending' : 'ok'} />
    {#if lastRequest}
      <CopyAs request={lastRequest} />
      <JsonInspector title="Request" data={lastRequest} />
    {/if}
    {#if lastResponse}<JsonInspector title="Response (meta)" data={lastResponse} />{/if}
  </div>
</section>

<style>
  .advanced {
    display: grid;
    grid-template-columns: 260px 1fr 1fr;
    gap: 16px;
    align-items: start;
  }
  .editor,
  .inspect {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .params {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
  .params label {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 13px;
    color: var(--muted);
  }
  input,
  select {
    background: #1a1a22;
    color: var(--fg);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 6px;
  }
  button {
    background: var(--accent);
    color: #0f0f12;
    padding: 10px;
    border: 0;
    border-radius: var(--radius);
    font-weight: 600;
    cursor: pointer;
  }
</style>
