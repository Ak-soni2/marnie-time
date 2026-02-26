# FuelEU Maritime Compliance Hub

## Overview
A full-stack implementation modeling core compliance logic for the FuelEU Maritime regulation. The system allows users to view routes, calculate GHG intensities and compliance balances (CB), simulate banking of compliance surplus, and analyze pooling mechanisms for fleet-wide compliance.

## Architecture Summary (Hexagonal Structure)
The backend employs a true **Ports & Adapters (Hexagonal)** layered infrastructure to heavily isolate business logic from server frameworks:
- **Domain Layer (`src/core/domain`)**: Contains pristine compliance, banking, and pooling behavior. Pure TypeScript functions without external dependencies.
- **Port Interface Layer (`src/core/ports`)**: Declares Repository interfaces the external world must satisfy.
- **Adapter Layer (`src/adapters`)**: 
  - *Outbound*: Maps PostgreSQL persistence layers (`PostgresRouteRepository`, etc.) to Port interfaces.
  - *Inbound*: Houses the Express HTTP APIs forwarding requests securely to the inner core.

## Setup & Run Instructions

### 1. Database Configuration
Ensure you have PostgreSQL installed. You can set up a local PG connection via environment variables in `backend/.env`.

**Using Docker (Recommended):**
If you have Docker installed, you can simply spin up the database via the provided `docker-compose.yml` file in the root directory:
```bash
docker-compose up -d
```
This will start a Postgres container populated with the correct credentials and database name `fueleu` on port `5432`.

### 2. Backend Bootstrapping
Navigate to the `backend/` directory:
```bash
cd backend/
npm install
npm run dev
```
The backend server will run on `http://localhost:4000`.

### 3. Frontend Running
Navigate to the `frontend/` directory (or wherever your frontend code is situated):
```bash
cd frontend/
npm install
npm run dev
```
Open `http://localhost:5173` to view the compliance dashboard.

## How to Execute Tests
The system's core Hexagonal domain logic is strictly validated using Jest.
To run the automated test suite, navigate to the `backend/` directory:
```bash
npm run test
```
*Note: The test suite uses `--experimental-vm-modules` to ensure accurate ES Module compatibility within the Jest runtime.*

## Sample Requests / Responses

### 1. Calculate Expected Route CB
**Request:**
`GET /compliance/cb?route_id=1`

**Response:**
```json
{
  "route_id": "1",
  "expected_cb": 15000.5,
  "status": "surplus"
}
```

### 2. Apply Banking Surplus
**Request:**
`POST /banking/apply`
```json
{
  "company_id": "COMP-001",
  "surplus_amount": 5000,
  "year": 2024
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully banked 5000 units of CB for 2024.",
  "new_balance": 12500
}
```

### 3. Fetch Fleet Pooling
**Request:**
`GET /pools`

**Response:**
```json
{
  "pool_id": "POOL-ALPHA",
  "total_compliance_balance": 25000,
  "members": [
    { "route_id": "1", "contribution": 15000 },
    { "route_id": "2", "contribution": 10000 }
  ]
}
```
