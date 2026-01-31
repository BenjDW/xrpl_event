# XRPL Event

A collection of XRPL (XRP Ledger) demos and training materials. This folder contains scripts and apps for **issuing tokens**, **creating AMM pools**, **enabling rippling**, **encrypted messaging over XRPL**, and **web-based wallet/contract tooling**.

---

## Project structure

```
xrpl_event/
├── README.md                 # This file
├── training_day1/            # XRPL tokens, trust lines, AMM (Node/TypeScript)
│   ├── index.ts              # Main entry: connect → enable rippling → create AMM
│   ├── createToken.ts        # Trust line + send issued token
│   ├── createAMM.ts          # Create token/XRP AMM pool
│   ├── utils.ts              # Hex conversion, enable rippling
│   ├── package.json
│   └── tsconfig.json
│
└── training_day2/
    ├── cypherchat/           # Encrypt/decrypt messages sent via XRPL memos
    │   ├── index.js          # Encrypt message → send as Payment memo
    │   ├── decypher.js       # Read memo → decrypt message
    │   └── package.json
    │
    └── training/             # Web apps (Next.js + Nuxt) for wallets & contracts
        ├── apps/
        │   ├── web/          # Next.js app
        │   └── web-nuxt/     # Nuxt app
        ├── package.json
        ├── pnpm-workspace.yaml
        └── turbo.json
```

---

## Prerequisites

- **Node.js** 18+ (20+ recommended)
- **npm** or **pnpm** (for `training_day2/training` use pnpm (recommended) or npm)
- XRPL **testnet** access (scripts use public testnet URLs; no mainnet keys in this repo)

---

## Training Day 1 – Tokens, Rippling & AMM

Node/TypeScript scripts that run on XRPL Testnet: enable default rippling, (optionally) create a token and send it, then create an AMM pool for that token and XRP.

### What it does

1. **Connect** to XRPL Testnet.
2. **Enable rippling** on the issuer account (so issued tokens can flow across trust lines).
3. **Optional:** Create a custom token (trust line + payment from issuer to receiver).
4. **Create an AMM** pool for the token and XRP (receiver is the pool creator).
5. **Print balances** and disconnect.

### How to use

```bash
cd xrpl_event/training_day1
npm install
npm start
```

- **Entry point:** `index.ts` (runs via `tsx`).
- **Wallets:** Uses hardcoded testnet seeds in `index.ts`. Replace `issuerseed` and `receiverseed` with your own testnet wallets if needed.
- **Token code:** The human-readable code is `"bde"`; it’s converted to a 40-character hex string for the ledger via `utils.ts` (`convertStringToHexPadded`).

### Key files

| File           | Purpose |
|----------------|--------|
| `index.ts`     | Connects to testnet, calls `enableRippling`, then `createAMM` (and optionally `createToken`). |
| `createToken.ts` | Creates a trust line (receiver) and sends issued tokens (issuer → receiver). |
| `createAMM.ts` | Builds and submits an `AMMCreate` transaction (token + XRP pool). |
| `utils.ts`     | `convertStringToHexPadded` (string → 40-char hex), `enableRippling` (AccountSet with Default Ripple). |

---

## Training Day 2 – Cypherchat (Encrypted messages over XRPL)

A small Node.js demo that **encrypts** a message and sends it in the **memo** of an XRPL Payment, then **decrypts** it on the other side using Ed25519/X25519 and NaCl.

### What it does

- **Encrypt:** Use sender’s private key and receiver’s public key to encrypt a message, then send an XRPL Payment whose memo contains the ciphertext (e.g. hex-encoded).
- **Decrypt:** Fetch the transaction (or use a known tx blob), read the memo, and decrypt with receiver’s private key and sender’s public key.

### How to use

```bash
cd xrpl_event/training_day2/cypherchat
npm install
node index.js    # Encrypt & send (edit message/wallets inside the file)
node decypher.js # Decrypt from a transaction (edit tx id / keys inside the file)
```

- **Wallets/keys:** Sender and receiver wallets (or public keys) are set inside `index.js` and `decypher.js`; replace with your own testnet keys.
- **Network:** Uses XRPL Testnet (URL is in the script).

---

## Training Day 2 – Web apps (Scaffold-XRP style)

Monorepo with **Next.js** and **Nuxt** apps for connecting wallets (Xaman, Crossmark, GemWallet, etc.), switching networks (AlphaNet, Testnet, Devnet), and interacting with XRPL (faucet, transactions, contracts).

### How to use

```bash
cd xrpl_event/training_day2/training
pnpm install
pnpm dev
```

- **Docs:** See `training_day2/training/README.md` and `QUICKSTART.md` for full usage, wallet connection, faucet, and contract deployment.
- **Apps:** Typically served at `http://localhost:3000` (or ports indicated in the repo).

---

## Configuration and safety

- **Seeds and keys:** Training Day 1 and Cypherchat use **testnet-only** seeds in code. Never put mainnet secret keys or seeds in this repo.
- **Network:** All scripts here target **XRPL Testnet** (e.g. `wss://s.altnet.rippletest.net:51233`). Change the client URL in code if you point to Devnet or another network.
- **Token code:** In Day 1, the token code is `"bde"` and is converted to 40-character hex for ledger use; you can change the string and re-run.

---

## Quick reference

| Goal                         | Where to go              | Command / action |
|-----------------------------|--------------------------|-------------------|
| Run tokens + AMM demo       | `training_day1`          | `npm install && npm start` |
| Encrypt/send message        | `training_day2/cypherchat` | Edit `index.js`, then `node index.js` |
| Decrypt received message   | `training_day2/cypherchat` | Edit `decypher.js`, then `node decypher.js` |
| Use web wallet/contract UI | `training_day2/training` | `pnpm install && pnpm dev` |

For more detail on each part, open the README (or source comments) inside the corresponding folder.
