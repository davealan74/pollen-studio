<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { parseCallbackFragment } from '$pollinations/auth';
  import { setKey } from '$stores/key.svelte';
  import { settings } from '$stores/settings.svelte';
  import { showToast } from '$stores/toast.svelte';

  let status = $state<'pending' | 'ok' | 'error'>('pending');
  let reason = $state('');

  onMount(() => {
    const r = parseCallbackFragment(location.hash);
    if (!r.ok) {
      status = 'error';
      reason = r.reason;
      showToast(`Authorization failed: ${r.reason}`, 'error');
      return;
    }
    setKey(r.key, settings.sessionOnlyKey ? 'session' : 'persistent');
    history.replaceState(null, '', '/auth/callback');
    status = 'ok';
    showToast('Connected to Pollinations.', 'success');
    goto('/simple', { replaceState: true });
  });
</script>

<section class="cb">
  {#if status === 'pending'}<p>Connecting…</p>{/if}
  {#if status === 'ok'}<p>Connected. Redirecting…</p>{/if}
  {#if status === 'error'}
    <h1>Couldn't connect</h1>
    <p>Reason: <code>{reason}</code></p>
    <a href="/auth/start">Try again</a>
  {/if}
</section>

<style>
  .cb {
    max-width: 480px;
    margin: 96px auto;
    text-align: center;
  }
</style>
