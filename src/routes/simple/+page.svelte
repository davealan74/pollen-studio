<script lang="ts">
  import PromptBox from '$components/PromptBox.svelte';
  import KeyConnect from '$components/KeyConnect.svelte';
  import RunCard from '$components/RunCard.svelte';
  import { keyStore } from '$stores/key.svelte';
  import { saveRun } from '$stores/runs.svelte';
  import { showToast } from '$stores/toast.svelte';
  import { VIBES, vibeById } from './vibes';
  import { PollinationsClient } from '$pollinations/client';
  import { generateImage, type ImageRequest } from '$pollinations/image';
  import { generateAudio, type AudioRequest } from '$pollinations/audio';
  import { newId } from '$utils/ulid';
  import { encodeShareHash, ShareTooLargeError } from '$stores/share.svelte';

  let prompt = $state('');
  let chosen = $state<string>('photoreal');
  let busy = $state(false);
  let blob = $state<Blob | null>(null);
  let kind = $state<'image' | 'audio'>('image');
  let error = $state<string | null>(null);

  const base = (import.meta.env.VITE_POLLINATIONS_BASE as string) ?? 'https://pollinations.ai';
  const client = new PollinationsClient({ base });

  async function generate() {
    if (!keyStore.key || !prompt.trim()) return;
    const vibe = vibeById(chosen);
    if (!vibe) return;
    busy = true;
    error = null;
    blob = null;
    try {
      if (vibe.surface === 'image') {
        kind = 'image';
        const req = vibe.request;
        blob = await generateImage(client, {
          prompt,
          seed: -1,
          model: String(req.model),
          width: Number(req.width),
          height: Number(req.height),
          quality: req.quality as ImageRequest['quality'],
          enhance: Boolean(req.enhance)
        });
      } else {
        kind = 'audio';
        const req = vibe.request;
        blob = await generateAudio(client, {
          prompt,
          model: String(req.model),
          voice: String(req.voice),
          speed: Number(req.speed)
        } satisfies AudioRequest);
      }
    } catch (e) {
      error = (e as Error).message;
      showToast(error, 'error');
    } finally {
      busy = false;
    }
  }

  async function save() {
    if (!blob) return;
    await saveRun({
      id: newId(),
      createdAt: Date.now(),
      surface: kind,
      mode: 'simple',
      prompt,
      request: { ...vibeById(chosen)?.request },
      cells: []
    });
    showToast('Saved to gallery.', 'success');
  }

  async function share() {
    try {
      const hash = encodeShareHash({
        surface: kind,
        mode: 'simple',
        prompt,
        request: { ...vibeById(chosen)?.request, vibe: chosen }
      });
      const url = `${location.origin}/simple${hash}`;
      await navigator.clipboard.writeText(url);
      showToast('Share link copied.', 'success');
    } catch (e) {
      if (e instanceof ShareTooLargeError) showToast('Run too large to share as a link.', 'error');
      else showToast((e as Error).message, 'error');
    }
  }

  function downloadBlob(b: Blob, k: 'image' | 'audio') {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(b);
    a.download = k === 'image' ? 'pollen.png' : 'pollen.mp3';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 0);
  }
</script>

<section class="simple">
  {#if !keyStore.key}
    <KeyConnect />
  {/if}
  <PromptBox
    bind:value={prompt}
    placeholder="Describe what you want — try 'a hummingbird sipping from a pollen-dusted iris.'"
    rows={4}
  />
  <div class="vibes">
    {#each VIBES as v}
      <button class:active={chosen === v.id} onclick={() => (chosen = v.id)}>{v.label}</button>
    {/each}
  </div>
  <button class="generate" onclick={generate} disabled={busy || !keyStore.key || !prompt.trim()}>
    {busy ? 'Generating…' : 'Generate'}
  </button>
  {#if blob || error || busy}
    <RunCard
      {kind}
      {blob}
      status={busy ? 'pending' : error ? 'error' : 'ok'}
      error={error ?? undefined}
      onStar={undefined}
      onDownload={() => blob && downloadBlob(blob, kind)}
      onCopyUrl={share}
      onFork={() => location.assign(`/compare?prompt=${encodeURIComponent(prompt)}`)}
    />
    <div class="row">
      <button onclick={save} disabled={!blob}>Save to gallery</button>
      <button onclick={share} disabled={!blob}>Share link</button>
    </div>
  {/if}
</section>

<style>
  .simple {
    max-width: 720px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .vibes {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .vibes button {
    background: #1a1a22;
    border: 1px solid var(--border);
    color: var(--fg);
    padding: 8px 14px;
    border-radius: 999px;
    cursor: pointer;
  }
  .vibes button.active {
    border-color: var(--accent);
    color: var(--accent);
  }
  .generate {
    background: var(--accent);
    color: #0f0f12;
    padding: 12px;
    border: 0;
    border-radius: var(--radius);
    font-weight: 600;
    cursor: pointer;
  }
  .generate:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .row {
    display: flex;
    gap: 8px;
  }
  .row button {
    background: #1a1a22;
    border: 1px solid var(--border);
    color: var(--fg);
    padding: 8px 14px;
    border-radius: var(--radius);
    cursor: pointer;
  }
</style>
