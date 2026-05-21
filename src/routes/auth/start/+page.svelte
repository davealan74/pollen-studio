<script lang="ts">
  import { onMount } from 'svelte';
  import { buildAuthorizeUrl } from '$pollinations/auth';
  import { keyStore, setKey } from '$stores/key.svelte';
  import { goto } from '$app/navigation';

  const clientId = import.meta.env.VITE_POLLINATIONS_CLIENT_ID as string;
  const authorizeBase =
    (import.meta.env.VITE_POLLINATIONS_AUTHORIZE_BASE as string) ?? 'https://enter.pollinations.ai';

  let pasting = $state(false);
  let pasted = $state('');
  let pasteError = $state('');

  onMount(() => {
    // If already connected, bounce to /simple
    if (keyStore.key) goto('/simple', { replaceState: true });
  });

  function connect() {
    const url = buildAuthorizeUrl({
      authorizeBase,
      clientId,
      redirectUri: `${location.origin}/auth/callback`,
      scope: 'profile usage',
      budget: 500,
      expiry: 30
    });
    location.assign(url);
  }

  function applyPasted() {
    pasteError = '';
    const k = pasted.trim();
    if (!/^(sk|pk)_[A-Za-z0-9][A-Za-z0-9_-]{7,255}$/.test(k)) {
      pasteError = 'Key must start with sk_ or pk_.';
      return;
    }
    setKey(k, 'persistent');
    goto('/simple', { replaceState: true });
  }
</script>

<section class="connect">
  <h1>Connect Pollinations</h1>
  <p>
    You'll be sent to <code>enter.pollinations.ai</code> to authorize this app. We never see your key
    on our server — it comes back to your browser only.
  </p>
  <p class="earnings">
    Pollen Studio adds a disclosed +25% surcharge on each call so it can keep developing. You'll see
    this on the consent screen too.
  </p>
  <button class="cta" onclick={connect} disabled={!clientId || clientId === 'pk_replace_me'}
    >Authorize with Pollinations</button
  >
  {#if !clientId || clientId === 'pk_replace_me'}
    <p class="warn">⚠ <code>VITE_POLLINATIONS_CLIENT_ID</code> is not configured.</p>
  {/if}
  <button class="link" onclick={() => (pasting = !pasting)}>or paste a key</button>
  {#if pasting}
    <div class="paste">
      <textarea bind:value={pasted} rows="3" placeholder="sk_… or pk_…"></textarea>
      <a href="https://enter.pollinations.ai/dashboard" target="_blank" rel="noopener noreferrer"
        >Where do I get this?</a
      >
      {#if pasteError}<p class="err">{pasteError}</p>{/if}
      <button onclick={applyPasted}>Use this key</button>
    </div>
  {/if}
</section>

<style>
  .connect {
    max-width: 560px;
    margin: 64px auto;
  }
  .cta {
    background: var(--accent);
    color: #0f0f12;
    padding: 12px 20px;
    border: 0;
    border-radius: var(--radius);
    font-weight: 600;
    cursor: pointer;
  }
  .cta:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .link {
    background: none;
    border: 0;
    color: var(--muted);
    margin-top: 16px;
    cursor: pointer;
    padding: 0;
  }
  .paste {
    margin-top: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  textarea {
    width: 100%;
    background: #1a1a22;
    color: var(--fg);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 8px;
    font-family: var(--font-mono);
  }
  .err {
    color: var(--danger);
    font-size: 13px;
  }
  .warn {
    color: var(--danger);
    font-size: 13px;
    margin-top: 8px;
  }
</style>
