<script lang="ts">
  interface Props {
    request: { method?: string; url: string; body?: unknown };
  }
  let { request }: Props = $props();

  const formats = ['curl', 'fetch', 'python'] as const;
  type Fmt = (typeof formats)[number];
  let fmt = $state<Fmt>('curl');

  const rendered = $derived.by(() => {
    if (fmt === 'curl') {
      let s = `curl -X ${request.method ?? 'GET'} '${request.url}' -H 'Authorization: Bearer YOUR_KEY'`;
      if (request.body)
        s += ` -H 'Content-Type: application/json' -d '${JSON.stringify(request.body)}'`;
      return s;
    }
    if (fmt === 'fetch') {
      return `await fetch('${request.url}', { method: '${request.method ?? 'GET'}', headers: { Authorization: 'Bearer YOUR_KEY' }${request.body ? `, body: ${JSON.stringify(JSON.stringify(request.body))}` : ''} })`;
    }
    return `import requests\nrequests.${(request.method ?? 'get').toLowerCase()}('${request.url}', headers={'Authorization': 'Bearer YOUR_KEY'}${request.body ? `, json=${JSON.stringify(request.body)}` : ''})`;
  });

  async function copy() {
    await navigator.clipboard.writeText(rendered);
  }
</script>

<div class="copy-as">
  <div class="tabs">
    {#each formats as f}
      <button class:active={fmt === f} onclick={() => (fmt = f)}>{f}</button>
    {/each}
    <button class="copy" onclick={copy}>Copy</button>
  </div>
  <pre>{rendered}</pre>
</div>

<style>
  .copy-as pre {
    background: #1a1a22;
    padding: 12px;
    border-radius: var(--radius);
    white-space: pre-wrap;
    word-break: break-all;
    font-family: var(--font-mono);
    font-size: 12px;
  }
  .tabs {
    display: flex;
    gap: 4px;
    margin-bottom: 4px;
  }
  .tabs button {
    background: #1a1a22;
    border: 1px solid var(--border);
    color: var(--fg);
    padding: 4px 8px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
  }
  .tabs button.active {
    border-color: var(--accent);
    color: var(--accent);
  }
  .copy {
    margin-left: auto;
  }
</style>
