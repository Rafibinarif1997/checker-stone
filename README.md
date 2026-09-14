# RH//HUB — Complete Pixel Website

This is the consolidated final build. It is a single deployable Node/Express application, not a collection of partial ZIPs.

## Included
- Pixel/retro full responsive UI
- Live Robinhood Chain RPC health, block and gas reads
- EVM wallet connect + automatic network add/switch
- Read-only wallet balance
- Live contract scanner: contract/EOA, bytecode size, ETH balance, nonce, token metadata
- Blockscout deep links
- Public project directory backed by server persistence
- Project submission workflow
- Admin approval/rejection panel at `/admin.html`
- Admin key protected API
- Health endpoint
- Production environment variables
- No private keys are stored or requested

## Run
1. Install Node.js 20+.
2. `npm install`
3. Copy `.env.example` to `.env` and set a strong `ADMIN_KEY`.
4. `npm start`
5. Open `http://localhost:3000`
6. Admin: `http://localhost:3000/admin.html`

## Production
Use a managed RPC provider instead of the public RPC, HTTPS, a real database (Postgres/Supabase), proper admin authentication/session cookies, rate limiting/WAF, and server-side secrets. The included JSON store is intentionally dependency-light for immediate deployment/testing.

## Network
Robinhood Chain mainnet: chain ID 4663, ETH, public RPC `https://rpc.mainnet.chain.robinhood.com`, explorer `https://robinhoodchain.blockscout.com`.
