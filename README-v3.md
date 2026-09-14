# Rhoodstone Mission v3 — Wallet + Missions + Admin UI

## Included
- Wallet-gated staker access using Robinhood Chain.
- NFT contract: `0x6be906e10351b4a970521c386e89d9e4e34c47c9`
- Staking contract: `0xA1Cf1e04c74984F7aF8CCd79Fb17E4fee54302E7`
- Chain ID: `4663` / hex `0x1237`
- Live 24-hour mission cards and mission drawer.
- One-submission-per-wallet database design.
- Admin console for campaign/task creation UI.
- `schema-v3.sql` for wallet/campaign/task/submission/winner tables.
- `check-staker-edge-function.ts` for server-side stake reads.
- `submit-mission-edge-function.ts` production submission rules.

## Important
The frontend task buttons and admin console are deliberately demo UI until Supabase is connected. Do not treat local checkbox state as proof of a social task. For production, the Submit endpoint must verify the wallet session, active stake, campaign window, every required task, and duplicate submission server-side.

## Deploy
1. Upload all files to GitHub Pages or your host.
2. Run `schema-v3.sql` in Supabase SQL Editor.
3. Deploy `check-staker-edge-function.ts` as `check-staker`.
4. Build a wallet-signature/auth challenge so a wallet address cannot be spoofed at submission time.
5. Connect `admin.html` to Supabase using authenticated admin RLS policies. Never put a Supabase service-role key in frontend code.
6. Replace the demo submission alert in `app.js` with the authenticated `submit-mission` Edge Function.
