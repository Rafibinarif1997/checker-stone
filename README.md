# Robinhood Chain Copilot

A production-oriented foundation for an independent Robinhood Chain portfolio, Stock Token, bridge and contract-intelligence product.

## What is real
- Robinhood Chain mainnet configuration: chain ID 4663, ETH, Blockscout.
- Server-side proxy to Robinhood's documented Stock Token APIs (`/rhj/assets`, `/rhj/prices/:symbol`, `/rhj/corporate-actions`).
- Server-side JSON-RPC reads for chain health, block number, gas, address balance, code and nonce.
- Browser EVM wallet connection using `window.ethereum` and `ethers`.
- Project submissions persisted in SQLite, with admin approve/reject workflow protected by `ADMIN_KEY`.
- Watchlist persisted in SQLite.
- Bridge information is sourced from Robinhood's documented routes; the UI intentionally does not invent live quotes/fees.

## Run
1. Install Node.js 20+.
2. Copy `.env.example` to `.env` and change `ADMIN_KEY`.
3. Run `npm install`.
4. Run `npm start`.
5. Open `http://localhost:3000`.
6. Admin: `http://localhost:3000/admin.html`.

## Production
Use a dedicated RPC provider as recommended by Robinhood Chain documentation, put the app behind HTTPS, set a strong admin secret, add backups for the SQLite DB, and configure a real indexed-data provider such as Alchemy for richer wallet history/token balances.

This product is independent and not endorsed, sponsored or affiliated with Robinhood. It is not investment advice.
