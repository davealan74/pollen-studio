<article class="prose">
  <h1>Privacy</h1>
  <p>Pollen Studio is a static browser app. It has no backend, no analytics, and no telemetry.</p>
  <h2>What we store</h2>
  <ul>
    <li>
      <strong>Your Pollinations API key</strong> — kept in your browser's <code>localStorage</code>
      (or <code>sessionStorage</code> if Session-only mode is on). Never transmitted to any server
      except <code>*.pollinations.ai</code>.
    </li>
    <li>
      <strong>Run history</strong> — kept in IndexedDB in your browser. Image and audio bytes are stored
      as blobs locally.
    </li>
    <li><strong>Settings</strong> — kept in <code>localStorage</code>.</li>
  </ul>
  <h2>What we never send</h2>
  <ul>
    <li>
      We never transmit your key, your prompts, or your results to any origin other than <code
        >*.pollinations.ai</code
      >.
    </li>
    <li>The CSP header set on this site restricts outbound network calls to that allowlist.</li>
  </ul>
  <h2>Disconnecting</h2>
  <p>
    Click your connection pill → <strong>Disconnect</strong>. This wipes the key from your browser.
    To also wipe stored runs, use the Gallery → <strong>Wipe local history</strong>.
  </p>
</article>

<style>
  .prose {
    max-width: 720px;
    margin: 32px auto;
    line-height: 1.6;
  }
  .prose code {
    background: #1a1a22;
    padding: 2px 6px;
    border-radius: 4px;
  }
</style>
