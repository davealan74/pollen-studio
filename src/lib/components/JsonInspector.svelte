<script lang="ts">
  interface Props {
    title: string;
    data: unknown;
  }
  let { title, data }: Props = $props();
  const pretty = $derived(JSON.stringify(data, null, 2));
</script>

<details open>
  <summary>{title}</summary>
  <pre>{pretty}</pre>
</details>

<style>
  details {
    background: #14141a;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 8px 12px;
  }
  summary {
    cursor: pointer;
    color: var(--muted);
    font-size: 13px;
  }
  pre {
    font-family: var(--font-mono);
    font-size: 12px;
    white-space: pre-wrap;
  }
</style>
