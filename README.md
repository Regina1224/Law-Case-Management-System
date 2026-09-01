# LCMS — Law Case Management System

A full-stack case management system for law firms, covering the complete workflow from intake to matter closure: intake triage, client records, matter tracking, tasks and deadlines, document management, and role-based administration.

Built as a portfolio project with a Clean Architecture .NET backend and a modern React + TypeScript frontend, deployed to Azure with a CI/CD pipeline.

## Live Demo

- Frontend: _add your deployed URL here_
- API: `lawfirm-dev-api` (Azure App Service)

## Features

**Intakes**
- Log new client inquiries and triage them by status (New → Under Review → Approved to Proceed → Converted / Declined)
- Convert an approved intake directly into a client + matter in one step, reusing an existing client or creating a new one
- Attach documents to an intake

**Clients**
- Individual and Corporate client records with contact details, address, and internal notes
- Client contacts and soft-deletable client notes
- Search and filter by name, type, and status

**Matters**
- Full matter lifecycle: Draft → Open → In Progress → On Hold → Closed → Archived
- Related parties, tasks (with priority, due date, assignee), deadlines, and notes per matter
- Document upload/download per matter, backed by Azure Blob Storage
- Close / Archive / Unarchive workflows with reason tracking

**Dashboard**
- At-a-glance stats: total/open matters, total clients, pending intakes, new clients and matters this month
- Matter-by-status and intake-pipeline breakdowns
- Recent matters and intakes needing attention

**Admin**
- Practice area reference data management (create/edit/deactivate)
- Application user role management (SystemAdmin, Partner, Lawyer, Paralegal, AdminStaff)

**Platform**
- Microsoft Entra ID (Azure AD) single sign-on via MSAL — no local password store
- Role-based authorization on sensitive endpoints
- Light / dark / system theme
- Responsive layout, code-split routes

## Tech Stack

**Frontend** — `lawfirm-web/`
- React 19 + TypeScript, Vite
- Tailwind CSS v4 + shadcn/ui (Base UI primitives)
- React Router, React Hook Form + Zod
- MSAL (`@azure/msal-browser`, `@azure/msal-react`) for auth
- Axios, Sonner (toasts)

**Backend** — Clean Architecture, .NET 10
- `LawFirm.Api` — ASP.NET Core Web API, controllers, auth middleware
- `LawFirm.Application` — services, DTOs, business logic
- `LawFirm.Domain` — entities, no external dependencies
- `LawFirm.Infrastructure` — EF Core repositories, Azure Blob Storage, SQL Server
- `LawFirm.Shared` — cross-cutting types

**Data & Infrastructure**
- Azure SQL Database (EF Core, code-first migrations)
- Azure Blob Storage (document uploads)
- Microsoft Entra ID (authentication/authorization)
- Azure App Service (API hosting)
- GitHub Actions (CI/CD)

## Architecture

```
lawfirm-web (React SPA)
      │  Bearer token (MSAL)
      ▼
LawFirm.Api            → controllers, auth, exception middleware
      │
LawFirm.Application     → services, DTOs, validation
      │
LawFirm.Domain          → entities (no dependencies)
      ▲
LawFirm.Infrastructure  → EF Core repositories, Azure Blob Storage
      │
LawFirm.Shared          → shared types used across layers
```

Dependencies point inward: `Api` → `Application` → `Domain`, with `Infrastructure` implementing interfaces defined by `Application`/`Domain`.

## Project Structure

```
LCMS/
├─ LawFirm.Api/              # ASP.NET Core Web API
│  ├─ Controllers/           # Matters, Clients, Intakes, Admin, etc.
│  ├─ Middleware/
│  └─ Authorization/
├─ LawFirm.Application/      # Services, DTOs, interfaces
├─ LawFirm.Domain/           # Entities
├─ LawFirm.Infrastructure/   # EF Core, repositories, Blob Storage
├─ LawFirm.Shared/           # Shared cross-layer types
├─ lawfirm-web/               # React + TypeScript frontend
│  └─ src/
│     ├─ pages/               # Route-level pages
│     ├─ components/          # Shared UI (ui/ = shadcn primitives)
│     ├─ services/            # API clients per resource
│     ├─ layouts/             # App shell, sidebar
│     └─ app/                 # Router, MSAL config
└─ .github/workflows/         # CI/CD pipeline
```

## Getting Started

### Prerequisites
- .NET 10 SDK, plus the EF Core CLI tool (`dotnet tool install --global dotnet-ef`)
- Node.js 20+ and npm
- An Azure SQL Database (or any SQL Server instance) and an Azure Blob Storage account
- A Microsoft Entra ID app registration (frontend SPA client + backend API client)

### Backend

```bash
cd LawFirm.Api

# Configure secrets locally (never commit these)
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "<your SQL connection string>"
dotnet user-secrets set "AzureBlobStorage:ConnectionString" "<your storage connection string>"

# Apply database migrations
dotnet ef database update

# Run the API (Development profile, http://localhost:5241)
dotnet run
```

### Frontend

```bash
cd lawfirm-web
npm install
```

Update `src/app/msalConfig.ts` with your own Entra ID `clientId`, `authority`, and API scope, then:

```bash
npm run dev      # http://localhost:5173
npm run build    # production build
npm run lint
```

## CI/CD

`.github/workflows/cicd.yml` runs on every push/PR to `dev`:
1. **Build & Test** — restores and builds the .NET solution, installs and builds the frontend
2. **Deploy to Azure** — on a push to `dev`, publishes the API and deploys it to Azure App Service via OIDC (`azure/login` + `azure/webapps-deploy`)

## Roadmap

- [ ] Automated test coverage (unit + integration)
- [ ] Cross-matter task/deadline dashboard aggregation
- [ ] Client-facing portal

## License

[MIT](LICENSE)
