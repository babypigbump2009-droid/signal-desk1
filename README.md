# Signal Desk (live data version)

Files:
- index.html and bg2.jpg: the dashboard
- api/candles.js, api/search.js: fetch real prices from Twelve Data (your key stays on the server)
- api/ai.js: AI analysis through the Anthropic API
- api/health.js, api/config.js: tell the page what is connected
- supabase.sql: sets up the accounts database (run once)

## Deploy (Vercel)
1. Put all of these files in a GitHub repository (keep the `api` folder as it is).
2. In Vercel: Add New, Project, import that repository, Deploy.
3. In the project: Settings, Environment Variables. Add:
   - `TWELVEDATA_KEY` = your Twelve Data API key
   - `ANTHROPIC_API_KEY` = your Anthropic API key
   - optional `ANTHROPIC_MODEL` to choose a different Claude model (default `claude-sonnet-5-5`)
4. Deployments, open the latest one, Redeploy (so it picks up the keys).
5. Open your site. The top strip should say Data: Live.

## Accounts (optional, free)
Accounts let people sign up with email and password, and keep their own watchlist and pick history on any device. Without these steps the site still works, but data stays in each visitor's browser and there is no Sign in button.
1. Go to supabase.com, sign up, and create a New project (free plan). Save the database password somewhere safe.
2. In the project: SQL Editor, New query, paste the contents of `supabase.sql`, click Run.
3. Authentication, URL Configuration: set Site URL to your Vercel address (for example https://signal-desk.vercel.app). This is where confirmation and reset emails send people.
4. Project Settings, API: copy the Project URL and the `anon` `public` key.
5. In Vercel, Settings, Environment Variables, add `SUPABASE_URL` (Project URL) and `SUPABASE_ANON_KEY` (anon public key). Then Redeploy.
6. Never use the `service_role` key anywhere in this project.

When accounts are on, only signed-in users can use the AI analysis (this protects your Anthropic credit). Signed-out visitors still get the rule-based analysis. Supabase's built-in email sending is limited for the free plan; for a public launch, connect your own email provider in Supabase (Authentication, SMTP).

## Things to know
- Free Twelve Data plans have a per-minute limit. One scan loads about 8 symbols, so repeated scans in a minute can hit it; results are cached for a short time to help. If a symbol fails the page says so.
- Which markets and symbols work (for example indices) depends on your Twelve Data plan. Unsupported symbols show an error instead of fake data.
- Prices may be delayed depending on your plan.
- Set a monthly spend limit in the Anthropic Console anyway. With accounts on, a signed-in user can still make many AI requests.
- Alerts work only while the page is open in a browser tab.
- Not financial advice. Picks are model estimates.
