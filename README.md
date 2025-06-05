# MedVault

**MedVault** is a privacy-preserving medical data vault built for ETH Belgrade 2025. It empowers patients to securely upload, store, and selectively share their encrypted medical records with doctors for a limited time — all without relying on a centralized backend.

---

## Problem

Medical data is often fragmented across systems and shared insecurely. Patients lack fine-grained control over who can access their records and when. Traditional solutions expose sensitive data to intermediaries and centralized databases.

---

## Solution

MedVault uses:
- **Client-side encryption** to ensure files are encrypted before leaving the browser.
- **Oasis Sapphire confidential smart contracts** to manage encrypted keys and access control with built-in privacy.
- **ROFL (Remote Oasis File Layer)** confidential compute to securely decrypt data on-demand.
- **IPFS** for decentralized, persistent file storage.
- **MetaMask** for Web3 login and identity management.

Patients generate **access tokens** that doctors can use to temporarily decrypt and view files, with full auditability on-chain.

---

## Tech Stack

| Layer        | Tech                           |
|--------------|--------------------------------|
| Frontend     | React + TypeScript + MUI       |
| Backend      | ROFL App (Node.js/Express)     |
| Blockchain   | Solidity + Hardhat + Sapphire  |
| Storage      | Pinata IPFS                    |
| Encryption   | AES-GCM (Symmetric), ECDH keys |

---

## Local Setup

### 1. Clone the repo

```bash
git clone https://github.com/branislavstojkovic70/ETH-Belgrade-MedVault.git
cd ETH-Belgrade-MedVault
```

### 2. In the frontend project create src/config/pinnata-config.ts, and add this:
```TypeScript
export const PINATA_API_KEY: string = "e439c459c05b732d22fe";
export const PINATA_API_SECRET: string = "ce96bf36f86019b3e83cef675376a928b8d648ce53804a48138802a26d0aead9"
```

### 3. Run the frontend:
```bash
npm install
npm run dev
```
