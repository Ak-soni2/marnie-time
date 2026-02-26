# FuelEU Maritime Compliance Platform - Reflection

## Architecture & Code Quality
The platform is built emphasizing a strict **Clean Architecture (Hexagonal)** approach on the backend. 
- **Domain Layer**: Centralized complex business rules securely in static services like `ComplianceCalculator`, `BankingService`, and `PoolingService`. These entities map out FuelEU Maritime's carbon balancing mechanisms devoid of framework side effects.
- **Port Interface Layer**: Declared independent Repositories ensuring infrastructural persistence operations decoupled from application flows.
- **Adapter Layer**: Implemented via PostgreSQL handlers (`PostgresRouteRepository`, etc.) mapping DB structures to domain interfaces. Inbound commands are routed through Express (`routes.ts`) controllers capturing network-level concerns and piping data downwards.

## Challenges & Solutions
1. **ESM / CommonJS Interop with TS-Jest**: Implementing Hexagonal architectural practices under `type: "module"` with NodeNext resulted in test-runtime module-resolution exceptions.
   - *Solution*: Leveraged the node experimental VM module flag `node --experimental-vm-modules` to support live ESM and fixed intra-project path extensions, ensuring CI/CD capabilities remain robust.
2. **Frontend State vs. Synchronous Computes**: Modeling the relationship between a single baseline `route_id` and calculating simultaneous GHG difference percentages required efficient frontend synchronization. 
   - *Solution*: Transitioned from hardcoded mock values to an `@tanstack/react-query` data fetcher enabling fast caching and auto-invalidation. `ComparePage` dynamically tracks selected baselines in memory and maps corresponding differences seamlessly.

## Trade-offs
Because the assignment mandated simplicity, certain edge cases like concurrent locking in database transaction isolation for Banking entries (to prevent double banking calls applying the identical surplus) were abstracted. In production scale setups, `SERIALIZABLE` isolation constraints and row-level logging over an event-streaming bus would be favored.

## Future Evolution
If expanded for a fully scalable microservice:
1. Extract the `cb` aggregation into materialized views since maritime computations rely heavily on multi-phase aggregations across enormous fleet sizes.
2. Introduce a pure `Application/Use-Case` CQRS layer (Command/Query Responsibility Segregation) between the HTTP entry point and the Domain services for advanced auditing context.

## AI & Tools Used
To rapidly develop, build, and thoroughly understand this project, several AI-driven tools were leveraged:
- **Lovable**: Used extensively for scaffolding and generating the frontend architecture, components, and UI structure.
- **Antigravity**: Served as the primary code editor and AI agent to iterate, fix bugs, and refactor code directly inside the development environment.
- **ChatGPT & Gemini**: Utilized strategically to brainstorm implementations, deeply understand the FuelEU Maritime domain logic, and figure out complex requirements.
