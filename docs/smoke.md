# Manual smoke checklist (before each release)

Run with a **real** Pollinations key. Expect each step to succeed within the listed time budget.

- [ ] `/` loads in < 1s; CTA visible.
- [ ] Click **Connect Pollinations** → consent screen shows app name "Pollen Studio" and +25% disclosure.
- [ ] After consent, lands on `/simple`, header pill reads `connected`.
- [ ] Open DevTools → Application → Local Storage; confirm `pollen_studio.key` is `sk_…`. Network tab shows **no** outbound request other than to `*.pollinations.ai`.
- [ ] In `/simple`: enter "a daffodil in macro" → **Photoreal** → Generate. Image appears within 30s.
- [ ] Click **Share link** → paste in private window → click **Generate** → succeeds with the other browser's key.
- [ ] `/compare`: pick **Image**, models {flux, gptimage}, 3 seeds → CostEstimate shows 6 cells; Generate Matrix; all 6 succeed.
- [ ] `/advanced`: edit a parameter, run → JsonInspector shows expected request body; **Copy as curl** copies a working command.
- [ ] `/gallery`: every above run appears; **Purge older than 30 days** removes nothing on a fresh DB.
- [ ] `/privacy`: page loads, lists all storage locations.
- [ ] DevTools Console: no errors.
- [ ] CSP header present (`curl -sI https://pollenstudio.cru2.net/ | grep -i content-security-policy`).
- [ ] HTTP redirects to HTTPS (`curl -sI http://pollenstudio.cru2.net/ | head -1`).
