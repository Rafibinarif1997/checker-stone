# RH//HUB — Robinhood Chain Pixel Command Center

A standalone, pixel/terminal-style front-end prototype for a Robinhood Chain ecosystem hub.

## Included
- Responsive pixel UI
- Market Radar / token directory
- Contract scanner workflow
- Wallet connection demo state
- Portfolio terminal
- Project directory
- Project submission modal
- Live activity mock feed
- Blockscout links
- Robinhood Chain mainnet constants: Chain ID 4663, ETH gas
- No private keys or signing

## Run
Open `index.html` in a browser.

## Production next steps
1. Replace mock token/activity data with an indexed data provider.
2. Add real EVM wallet connection (e.g. injected wallet / WalletConnect).
3. Add a backend + database for project submissions and admin approval.
4. Add contract ABI/source verification and token-holder analytics.
5. Add authentication and moderation/risk policies.
6. Keep API keys server-side; never ship provider secrets in browser code.
