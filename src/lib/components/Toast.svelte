<script lang="ts">
  import { toasts } from '$stores/toast.svelte';
</script>

<div class="toast-root" role="status" aria-live="polite">
  {#each toasts.items as t (t.id)}
    <div class="toast" data-kind={t.kind}>{t.message}</div>
  {/each}
</div>

<style>
  .toast-root {
    position: fixed;
    right: 16px;
    bottom: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    z-index: 1000;
  }
  .toast {
    padding: 10px 14px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: #1a1a22;
    max-width: 320px;
    font-size: 14px;
  }
  .toast[data-kind='error'] {
    border-color: var(--danger);
  }
  .toast[data-kind='success'] {
    border-color: var(--accent);
  }
</style>
