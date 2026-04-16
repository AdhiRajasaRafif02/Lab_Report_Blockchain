# Lab Report Blockchain

Web-based tamper-evident laboratory report verification system using off-chain file storage, PostgreSQL metadata, and on-chain hash registration.

## Monorepo Folder Structure

```text
Lab_Report_Blockchain/
├─ apps/
│  ├─ backend/
│  │  ├─ prisma/
│  │  │  └─ schema.prisma
│  │  ├─ src/
│  │  │  ├─ config/
│  │  │  │  └─ env.ts
│  │  │  ├─ controllers/
│  │  │  ├─ middlewares/
│  │  │  ├─ routes/
│  │  │  │  └─ index.ts
│  │  │  ├─ services/
│  │  │  ├─ types/
│  │  │  ├─ utils/
│  │  │  ├─ app.ts
│  │  │  └─ server.ts
│  │  ├─ .env.example
│  │  ├─ package.json
│  │  └─ tsconfig.json
│  └─ frontend/
│     ├─ src/
│     │  ├─ components/
│     │  ├─ hooks/
│     │  ├─ pages/
│     │  │  ├─ AdminPage.tsx
│     │  │  ├─ DashboardPage.tsx
│     │  │  ├─ DocumentDetailPage.tsx
│     │  │  ├─ LoginPage.tsx
│     │  │  ├─ UploadPage.tsx
│     │  │  └─ VerifyPage.tsx
│     │  ├─ services/
│     │  ├─ types/
│     │  ├─ App.tsx
│     │  ├─ main.tsx
│     │  └─ styles.css
│     ├─ index.html
│     ├─ package.json
│     ├─ postcss.config.js
│     ├─ tailwind.config.ts
│     ├─ tsconfig.json
│     └─ vite.config.ts
├─ packages/
│  ├─ contracts/
│  │  ├─ contracts/
│  │  │  └─ LabReportRegistry.sol
│  │  ├─ scripts/
│  │  │  └─ deploy.ts
│  │  ├─ test/
│  │  │  └─ LabReportRegistry.ts
│  │  ├─ .env.example
│  │  ├─ hardhat.config.ts
│  │  ├─ package.json
│  │  └─ tsconfig.json
│  └─ shared/
│     ├─ src/
│     │  └─ index.ts
│     ├─ package.json
│     └─ tsconfig.json
├─ .gitignore
├─ package.json
└─ README.md
```

## Setup Instructions

1. Install dependencies:
   - `npm install`
2. Create env files:
   - copy `apps/backend/.env.example` to `apps/backend/.env`
   - copy `apps/frontend/.env.example` to `apps/frontend/.env`
   - copy `packages/contracts/.env.example` to `packages/contracts/.env`
3. Ensure PostgreSQL is running, then set `DATABASE_URL` in `apps/backend/.env`.
4. Generate Prisma client:
   - `npm run prisma:generate --workspace @lab/backend`
5. Run database migration:
   - `npm run prisma:migrate --workspace @lab/backend`
6. Start local blockchain (terminal 1):
   - `npm run dev:contracts`
7. Start backend API (terminal 2):
   - `npm run dev:backend`
8. Start frontend app (terminal 3):
   - `npm run dev:frontend`

## Useful Scripts

Root:
- `npm run build`
- `npm run test`
- `npm run lint`
- `npm run format`

Backend:
- `npm run dev --workspace @lab/backend`
- `npm run build --workspace @lab/backend`
- `npm run test --workspace @lab/backend`
- `npm run lint --workspace @lab/backend`

Frontend:
- `npm run dev --workspace @lab/frontend`
- `npm run build --workspace @lab/frontend`
- `npm run test --workspace @lab/frontend`
- `npm run lint --workspace @lab/frontend`

Contracts:
- `npm run chain --workspace @lab/contracts`
- `npm run build --workspace @lab/contracts`
- `npm run test --workspace @lab/contracts`
- `npm run deploy:local --workspace @lab/contracts`

## Blockchain Layer (Hardhat + Solidity)

Contract: `packages/contracts/contracts/LabReportRegistry.sol`

### On-chain integrity model
- Stores metadata and hash proof only
- Never stores file binary/content on-chain

### Core capabilities
1. `registerDocument(...)`
2. `getDocumentByHash(bytes32)`
3. `getDocumentById(string)`
4. `verifyDocumentHash(bytes32)`
5. `revokeDocument(string,string)`
6. `getDocumentStatus(string)`
7. Events for registration, verification checks, and revocation

### Access control
- Owner is set at deploy time
- Owner can authorize registrars via `setRegistrar(address,bool)`
- Only authorized registrar can register
- Only owner can revoke

### Local demo run
1. Start Hardhat local chain:
   - `npm run chain --workspace @lab/contracts`
2. Deploy contract:
   - `npm run deploy:local --workspace @lab/contracts`
3. Save deployed address into `packages/contracts/.env`:
   - `CONTRACT_ADDRESS=0x...`
4. Run interaction demo:
   - `npm run interact:local --workspace @lab/contracts`
5. Run contract tests:
   - `npm run test --workspace @lab/contracts`

### Test coverage
- successful registration
- duplicate hash rejection
- valid lookup by hash and id
- revocation flow
- revoked status query
- unauthorized registration/revocation rejection
