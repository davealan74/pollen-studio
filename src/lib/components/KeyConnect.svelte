<script lang="ts">
  import { keyStore } from '$stores/key.svelte';
  let { compact = false } = $props<{ compact?: boolean }>();
</script>

{#if !keyStore.key}
  <a class="cta" class:compact href="/auth/start">Connect Pollinations to run</a>
{/if}

<style>
  .cta {
    display: inline-block;
    padding: 10px 16px;
    background: var(--accent);
    color: #0f0f12;
    font-weight: 600;
    border-radius: var(--radius);
    text-decoration: none;
  }
  .cta.compact {
    padding: 6px 12px;
    font-size: 13px;
  }
</style>
