<script lang="ts">
  interface Props {
    value: string;
    placeholder?: string;
    rows?: number;
  }
  let {
    value = $bindable(''),
    placeholder = 'Describe what you want…',
    rows = 4
  }: Props = $props();
</script>

<textarea {placeholder} {rows} bind:value></textarea>

<style>
  textarea {
    width: 100%;
    resize: vertical;
    padding: 12px;
    background: #1a1a22;
    color: var(--fg);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    font-family: var(--font-sans);
    font-size: 16px;
    line-height: 1.5;
  }
</style>
