# Rhoodstone Mission v4 — Real Supabase Admin + Submission

## 1. Configure
Copy `config.js` values:
- SUPABASE_URL
- SUPABASE_ANON_KEY
- SUBMIT_FUNCTION_URL (deployed `submit-mission` function URL)

Never put the Supabase service-role key in the website.

## 2. Supabase
Run `schema-v4.sql` in Supabase SQL Editor.
Create an Auth user for the admin, then insert its UUID into `admin_users` using the SQL comment at the bottom of the schema.

## 3. Admin
Open `admin.html`, sign in with the Supabase Auth email/password account. The panel then performs real project/task CRUD under admin RLS.

## 4. Submit function
Deploy `submit-mission-edge-function.ts` as a Supabase Edge Function and set:
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- RPC_URL=https://rpc.mainnet.chain.robinhood.com

The endpoint verifies the wallet signature, live 24h campaign, active stake on the staking contract, required server-side task verifications, and one submission per wallet/project.

## 5. Important
X follow/like/repost verification is intentionally NOT faked. `task_verifications` must be populated by the real verifier before submission is accepted. The existing `verification-edge-function.ts` remains the place to connect the X API verifier.
