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
   - `npm install --include=dev`
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

## Quick Start (Local Demo)

This system runs 3 processes locally:
- **Smart contract chain** (Hardhat node) on `http://127.0.0.1:8545`
- **Backend API** (Express + Prisma + PostgreSQL) on `http://localhost:4000`
- **Frontend** (Vite React) on `http://localhost:5173`

### Prerequisites
- Node.js (LTS recommended) + npm
- PostgreSQL installed and running (no Docker)

### 1) Install dependencies
From repo root:

```bash
npm install --include=dev
```

### 2) Create `.env` files
Copy examples:

- `apps/backend/.env.example` → `apps/backend/.env`
- `apps/frontend/.env.example` → `apps/frontend/.env`
- `packages/contracts/.env.example` → `packages/contracts/.env`

Windows PowerShell:

```powershell
Copy-Item apps/backend/.env.example apps/backend/.env
Copy-Item apps/frontend/.env.example apps/frontend/.env
Copy-Item packages/contracts/.env.example packages/contracts/.env
```

### 3) Configure PostgreSQL
1. Create a database, e.g. `lab_report_blockchain`
2. Update `DATABASE_URL` in `apps/backend/.env`

Example:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lab_report_blockchain?schema=public
```

### 4) Prisma: generate, migrate, seed
From repo root:

```bash
npm run prisma:generate --workspace @lab/backend
npm run prisma:migrate --workspace @lab/backend
npm run prisma:seed --workspace @lab/backend
```

### 5) Start local blockchain (Terminal 1)

```bash
npm run dev:contracts
```

Keep this terminal running.

### 6) Deploy contract (Terminal 2)

```bash
npm run deploy:local --workspace @lab/contracts
```

Copy the deployed contract address from the output (`LabReportRegistry deployed to: 0x...`).

### 7) Configure blockchain env (backend)
Update `apps/backend/.env`:

- `BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545`
- `BLOCKCHAIN_CONTRACT_ADDRESS=0x...` (from deploy output)
- `BLOCKCHAIN_PRIVATE_KEY=0x...` (one of Hardhat node accounts; deployer/owner recommended)

Notes:
- `BLOCKCHAIN_CONTRACT_ADDRESS` must match regex `^0x[a-fA-F0-9]{40}$`
- `BLOCKCHAIN_PRIVATE_KEY` must match regex `^0x[a-fA-F0-9]{64}$`

### 8) Start backend API (Terminal 3)

```bash
npm run dev:backend
```

Health check:
- `GET http://localhost:4000/health`

### 9) Start frontend (Terminal 4)

```bash
npm run dev:frontend
```

Open:
- `http://localhost:5173`

Frontend calls API using `apps/frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:4000/api
```

### Demo accounts
Seeded by `apps/backend/prisma/seed.ts`:

- Admin: `admin@lab.local` / `admin1234`
- Lab staff: `staff@lab.local` / `staff1234`
- Verifier: `verifier@lab.local` / `verify1234`
- User: `user@lab.local` / `user1234`

### Suggested demo flow
1. Login as **Lab staff** → Upload/Register a PDF.
2. Open **Documents** → open a document detail (shows DB metadata + on-chain proof).
3. Login as **Verifier** → Verify the same PDF.
   - Verify computes SHA-256 in the browser and submits only the hash (no file upload for verification).
4. Login as **Admin** → Revoke a document with a reason → verify again becomes `REVOKED`.

### Troubleshooting

#### “Document metadata is missing on blockchain”
This usually happens if Hardhat node was restarted or the contract was redeployed: DB still has documents, but chain state is reset.

Fix by rehydrating DB → chain:

```bash
npm -w apps/backend run chain:rehydrate
```

After rehydrate, restart backend and refresh frontend.

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

## Practical Testing Strategy

### Backend (Vitest)
- **Unit tests with mocks** for services that depend on Prisma, blockchain, and filesystem:
  - `auth.service` (register/login + duplicate prevention)
  - `documents.service` (upload/hash/registration + duplicate checks + rollback)
  - `verification.service` (AUTHENTIC/REVOKED/MISMATCH/NOT_FOUND accuracy)
  - `revocation.service` (revoke behavior + audit creation)
- **Critical integration test** with `supertest`:
  - route protection and RBAC behavior on real Express app wiring

### Smart Contract (Hardhat)
- Contract-level tests for registration, duplicate prevention, lookups, revocation, status queries, and unauthorized actions.

### Mock strategy
- Backend tests mock:
  - Prisma client (`src/tests/mocks/prisma.mock.ts`)
  - Blockchain service (ethers/contract writes)
  - Audit service
- Integration test keeps middleware/router wiring real and validates real HTTP responses.

### Test commands
1. Backend tests:
   - `npm run test --workspace @lab/backend`
2. Smart contract tests:
   - `npm run test --workspace @lab/contracts`
3. All tests (workspace):
   - `npm run test`
