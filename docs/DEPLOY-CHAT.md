# Deploy "Ask my AI" — Tim's checklist

Everything here needs Tim's accounts or costs money, so Tim runs it. The site
already works without the Worker: the chat panel answers from saved answers
until steps 1–6 are done.

Run Worker commands from `worker/` with Node 22+ (`nvm use` reads `.nvmrc`).

## 1. Anthropic (API key + spend cap)

1. console.anthropic.com → **Settings → Limits**: set a monthly spend limit of
   **$5**. At ~$0.0002 per message that's about 25,000 messages.
2. **API Keys** → create a key named `timotholt-chat`. Copy it; don't paste it
   anywhere in the repo.

## 2. Cloudflare login

```bash
cd worker && nvm use && npx wrangler login
```

## 3. Turnstile widget (free)

Cloudflare dashboard → **Turnstile → Add widget**:
- Name: `timotholt-chat`
- Hostnames: `timotholt.com`, `www.timotholt.com`, `timotholt.github.io`
- Widget mode: **Invisible**

Copy the **site key** (public) and **secret key** (private).

## 4. Worker secrets

```bash
npx wrangler secret put ANTHROPIC_API_KEY
```

```bash
npx wrangler secret put TURNSTILE_SECRET
```

Paste each value when prompted. They live only in Cloudflare.

## 5. Deploy the Worker

```bash
npx wrangler deploy
```

Note the URL it prints, e.g. `https://timotholt-chat.<subdomain>.workers.dev`.
The chat endpoint is that URL + `/chat`.

Check in the dashboard (Workers → timotholt-chat → Settings → Bindings) that
`RATE_LIMITER` and `CHAT_LOG` appear. The Analytics Engine dataset is free on
Workers Free (100k points/day). Cloudflare's docs don't state pricing for the
Rate Limiting binding; if the dashboard ever shows a charge for it, delete the
`[[ratelimits]]` block in `wrangler.toml` and redeploy: the Worker skips the
check when the binding is missing (Turnstile, the 10-question cap and the $5
spend cap still apply).

### If the model returns 429

If your key has no access to `claude-haiku-5-5` yet, every answer falls back to
the saved answers and the Worker log shows `model error: 429`. Check:
`npx wrangler tail`. Until access arrives, run on Haiku 4.5:

```bash
npx wrangler deploy --var MODEL:claude-haiku-4-5
```

Haiku 4.5 costs about 10× more ($1 / $5 per MTok, ~$0.002 per message, so the
$5 cap ≈ 2,500 messages) and won't cache a prompt this short. Redeploy without
`--var` to return to 5.5.

## 6. Point the site at the Worker

GitHub → repo **Settings → Secrets and variables → Actions → Variables**:
- `PUBLIC_CHAT_URL` = `https://timotholt-chat.<subdomain>.workers.dev/chat`
- `PUBLIC_TURNSTILE_SITE_KEY` = the Turnstile site key

Then **Actions → Deploy Astro to GitHub Pages → Run workflow**.

## 7. Eval before announcing it (costs ~1 cent)

Runs locally against your real key with Cloudflare's test Turnstile secret:

```bash
cp .dev.vars.example .dev.vars
```

Edit `.dev.vars`: put your Anthropic key in `ANTHROPIC_API_KEY`. Then in one terminal:

```bash
npm run dev
```

And in another:

```bash
npm run eval
```

It asks 30 questions (20 recruiter, 10 adversarial; ~7 minutes because of the
rate limit) and writes `docs/evals/<date>.md`. Read it: every answer grounded
in `docs/persona.md`, refusals polite, nothing invented.

## 8. Fill the persona gaps

`docs/persona.md` has two `TODO(tim)` lines (availability; why Forward Deployed
Engineering). Until filled, the bot says it doesn't know and points to email.
After editing: `npx wrangler deploy`.

## Monthly: gap list

Create a Cloudflare API token with **Account Analytics: Read**, then:

```bash
CLOUDFLARE_ACCOUNT_ID=<id> CLOUDFLARE_API_TOKEN=<token> npm run gaps
```

It prints questions per topic and keywords from questions the bot couldn't
answer. Add the missing facts to `docs/persona.md` and redeploy.

## Turning it off

Remove `PUBLIC_CHAT_URL` from the repo variables and rerun the site deploy: the
panel goes back to saved answers. Or `npx wrangler delete` to remove the Worker.
