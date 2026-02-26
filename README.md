# FuelEU Maritime Compliance Hub

A full-stack implementation modeling core compliance logic for the FuelEU Maritime regulation, built using a Hexagonal architecture. The system focuses on strict separation of concerns, segregating robust business entities (GHG intensities, Compliance Balance pooling) from framework constraints.

## Tech Stack
-   **Frontend**: React (Vite), TypeScript, Tailwind CSS, Framer Motion, TanStack Query, Recharts, Shadcn UI
-   **Backend**: Node.js, Express, TypeScript, PostgreSQL
-   **Testing**: Jest (Unit testing the Domain Services)

## Setup Instructions

### 1. Database Configuration
Ensure you have PostgreSQL installed. You can set up a local PG connection via environment variables in `backend/.env`.

### 2. Backend Bootstrapping
Navigate to the `backend/` directory:
```bash
npm install
npm run dev
```

Run tests to verify the core Hexagonal domains:
```bash
npm run test
```

### 3. Frontend Running
Navigate to the `frontend/maritime-compliance-hub/` directory:
```bash
npm install
npm run dev
```
Open `http://localhost:5173` to view the compliance dashboard, connected to `http://localhost:4000`.

## Architecture Note
The backend employs a true Ports & Adapters layered infrastructure:
-   `src/core/domain`: Contains pristine compliance, banking, and pooling behavior.
-   `src/core/ports`: Declares interfaces the external world must satisfy.
-   `src/adapters/outbound`: Maps Postgres SQL persistence to Port interfaces.
-   `src/adapters/inbound`: Houses the Express HTTP APIs forwarding requests securely to the inner core. 
