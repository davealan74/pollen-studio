<script lang="ts">
  interface Props {
    kind: 'image' | 'text' | 'audio';
    blob?: Blob | null;
    text?: string;
    onStar?: () => void;
    onDownload?: () => void;
    onCopyUrl?: () => void;
    onFork?: () => void;
    starred?: boolean;
    status?: 'pending' | 'ok' | 'error';
    error?: string;
  }
  let {
    kind,
    blob,
    text,
    onStar,
    onDownload,
    onCopyUrl,
    onFork,
    starred = false,
    status = 'ok',
    error
  }: Props = $props();
  let url = $derived(blob ? URL.createObjectURL(blob) : '');
  $effect(() => () => {
    if (url) URL.revokeObjectURL(url);
  });
</script>

<article class="card" data-status={status}>
  {#if status === 'pending'}
    <div class="placeholder">Generating…</div>
  {:else if status === 'error'}
    <div class="placeholder err">{error ?? 'Failed'}</div>
  {:else if kind === 'image' && url}
    <img src={url} alt="generated" />
  {:else if kind === 'audio' && url}
    <audio src={url} controls></audio>
  {:else if kind === 'text'}
    <pre>{text}</pre>
  {/if}
  <footer>
    <!-- eslint-disable-next-line @typescript-eslint/no-empty-function -->
    <button onclick={onStar ?? (() => {})} aria-pressed={starred}>{starred ? '★' : '☆'}</button>
    <button onclick={onDownload}>Download</button>
    <button onclick={onCopyUrl}>Copy URL</button>
    <button onclick={onFork}>Fork</button>
  </footer>
</article>

<style>
  .card {
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 12px;
    background: #14141a;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .card[data-status='error'] {
    border-color: var(--danger);
  }
  .placeholder {
    padding: 32px;
    text-align: center;
    color: var(--muted);
  }
  .placeholder.err {
    color: var(--danger);
  }
  img {
    width: 100%;
    border-radius: calc(var(--radius) - 4px);
    display: block;
  }
  pre {
    white-space: pre-wrap;
    background: #1a1a22;
    padding: 12px;
    border-radius: var(--radius);
  }
  footer {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }
  footer button {
    background: #1a1a22;
    border: 1px solid var(--border);
    color: var(--fg);
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 12px;
    cursor: pointer;
  }
</style>
