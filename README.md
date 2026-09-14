# Rhoodstone Mission v2 — Wallet + Staker Gate

This version replaces X login with an EVM wallet gate.

## Network
- Robinhood Chain mainnet
- Chain ID: `4663`
- Public RPC: `https://rpc.mainnet.chain.robinhood.com`
- Explorer: `https://robinhoodchain.blockscout.com`

## Contracts
- Rhood Stone NFT: `0x6be906e10351b4a970521c386e89d9e4e34c47c9`
- Staking: `0xA1Cf1e04c74984F7aF8CCd79Fb17E4fee54302E7`

The staking contract exposes `isOGEligible(address)` and `stakedBalance(address)`. The site uses `isOGEligible` as the source of truth: 1+ currently staked Stone means eligible. During the 7-day unstake cooldown, the contract still reports the wallet as eligible.

## User flow
1. Connect EVM wallet.
2. Switch/add Robinhood Chain if necessary.
3. Read the staking contract.
4. If eligible, show **STAKER VERIFIED** and **Go To Mission**.
5. If not eligible, block Mission access.

## Important
The current mission submission inside this prototype is still a demo UI. For production, the Supabase Edge Function must re-check `isOGEligible(user_wallet)` server-side before accepting a submission. Never trust a browser-only eligibility flag.
