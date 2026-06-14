# 🤖 AI Productivity Tracking System

A production-ready, full-stack web application for tracking AI utilisation across SDLC activities — managing projects, employees, Jira user stories, sprints, and generating detailed Excel productivity reports.

[![Backend CI](https://github.com/SurajPrasadd/ai-report/actions/workflows/ci-backend.yml/badge.svg)](https://github.com/SurajPrasadd/ai-report/actions/workflows/ci-backend.yml)
[![Frontend CI](https://github.com/SurajPrasadd/ai-report/actions/workflows/ci-frontend.yml/badge.svg)](https://github.com/SurajPrasadd/ai-report/actions/workflows/ci-frontend.yml)

---

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Quick Start (Docker)](#quick-start-docker)
- [Frontend Setup](#frontend-setup)
- [Backend Setup](#backend-setup)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Modules](#modules)
- [Database Schema](#database-schema)
- [Testing](#testing)
- [CI/CD Pipeline](#cicd-pipeline)
- [Production Deployment](#production-deployment)

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** + **Vite 5** | UI framework and build tool |
| **TypeScript** | Type safety across the entire frontend |
| **Redux Toolkit** | Global state management (8 slices) |
| **React Router v6** | Client-side routing with protected routes |
| **React Hook Form** + **Yup** | Form handling and validation |
| **Recharts** | Interactive charts (Bar, Pie, Line) |
| **Axios** | HTTP client with JWT refresh interceptors |
| **CSS Modules** + **CSS Variables** | Scoped styles + Light/Dark theme |
| **react-hot-toast** | Toast notifications |
| **react-icons** | Icon library |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js 20** + **Express** | REST API server |
| **TypeScript** | Full type safety |
| **PostgreSQL 15** | Primary database |
| **JWT** | Authentication (access + refresh tokens) |
| **Swagger / OpenAPI 3.0** | Auto-generated API documentation |
| **Winston** | Structured logging |
| **XLSX** | Excel report generation and import |
| **Jest** + **Supertest** | Unit and integration testing |

### Infrastructure
| Technology | Purpose |
|---|---|
| **Docker** + **Docker Compose** | Containerised deployment |
| **Nginx** | Frontend web server + SPA routing |
| **GitHub Actions** | CI/CD pipelines |
| **PgAdmin** | Database management UI |

---

## 🏗️ Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                  React.js Web Application                    │
│   Vite │ Redux Toolkit │ React Router │ Recharts │ Axios     │
│                  http://localhost:3001                        │
└────────────────────────────┬─────────────────────────────────┘
                             │ REST API  (JWT)
┌────────────────────────────▼─────────────────────────────────┐
│                 Node.js + Express API                         │
│   TypeScript │ JWT Auth │ Rate Limiting │ Swagger            │
│   Controller → Service → Repository pattern                  │
│                  http://localhost:3000                        │
└────────────────────────────┬─────────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────────┐
│                     PostgreSQL 15                             │
│  projects │ employees │ sprints │ jira_stories │ ai_usage    │
│  project_manager_mapping │ employee_project_mapping          │
│  audit_logs │ refresh_tokens                                  │
└──────────────────────────────────────────────────────────────┘
```

---

## 📂 Project Structure

```
ai-report/
│
├── frontend/                        # React.js Web Application
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/              # Sidebar, Navbar, AppLayout
│   │   │   └── ui/                  # Button, Input, Table, Modal,
│   │   │                            # Badge, StatCard, Tabs, SearchBar…
│   │   ├── pages/
│   │   │   ├── auth/                # Login, ForgotPassword
│   │   │   ├── dashboard/           # KPI cards + 4 charts
│   │   │   ├── projects/            # List, Detail (tabs), Form modal
│   │   │   ├── employees/           # Employee list with role chips
│   │   │   ├── sprints/             # Sprint list + form modal
│   │   │   ├── jira/                # Story list, detail, form
│   │   │   ├── ai-usage/            # AI tracking list, detail, form
│   │   │   └── excel/               # Export/import with preview
│   │   ├── router/                  # AppRouter, ProtectedRoute
│   │   ├── store/
│   │   │   ├── slices/              # auth, theme, projects, employees,
│   │   │   │                        # sprints, jira, aiUsage, dashboard
│   │   │   └── index.ts             # Redux store
│   │   ├── services/api.ts          # Axios + silent JWT refresh
│   │   ├── styles/                  # global.css, variables.css (theme)
│   │   ├── types/index.ts           # All TypeScript interfaces
│   │   └── utils/                   # helpers.ts, constants.ts
│   ├── Dockerfile                   # Multi-stage: Vite build → Nginx
│   ├── nginx.conf                   # SPA routing + asset caching
│   ├── vite.config.ts
│   └── package.json
│
├── backend/                         # Node.js + Express API
│   ├── src/
│   │   ├── config/                  # database.ts, env.ts
│   │   ├── database/                # schema.sql, seed.sql, migrate.ts
│   │   ├── middleware/              # auth, error, validation, audit
│   │   ├── modules/
│   │   │   ├── auth/                # login, register, JWT, refresh
│   │   │   ├── project/             # CRUD + PM/employee mapping
│   │   │   ├── employee/            # employee management
│   │   │   ├── sprint/              # sprint CRUD
│   │   │   ├── jira/                # story CRUD + Jira API sync
│   │   │   ├── ai-usage/            # AI tracking + effort stats
│   │   │   ├── dashboard/           # analytics aggregations
│   │   │   └── excel/               # XLSX 2-sheet export/import
│   │   ├── swagger/                 # OpenAPI 3.0 spec
│   │   ├── utils/                   # logger.ts, response.ts
│   │   └── server.ts
│   ├── Dockerfile                   # Multi-stage production build
│   ├── package.json
│   └── tsconfig.json
│
├── docker-compose.yml               # Postgres + Backend + Frontend + PgAdmin
├── .github/workflows/               # CI/CD pipelines
│   ├── ci-backend.yml
│   └── ci-frontend.yml
└── README.md
```

---

## ✅ Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| **Node.js** | 20+ | Run frontend and backend |
| **npm** | 10+ | Package management |
| **PostgreSQL** | 15+ | Database (or use Docker) |
| **Docker** | 24+ | Containerised setup |
| **Docker Compose** | 2.x | Multi-service orchestration |
| **Git** | any | Version control |

---

## 🚀 Quick Start (Docker)

The fastest way to run the entire stack:

```bash
# 1. Clone the repository
git clone https://github.com/SurajPrasadd/ai-report.git
cd ai-report

# 2. Create backend environment file
cp backend/.env.example backend/.env
# Edit backend/.env — set DB_PASSWORD, JWT_SECRET, etc.

# 3. Start all services
docker-compose up -d --build

# Services available:
# Frontend:  http://localhost
# Backend:   http://localhost:3000
# Swagger:   http://localhost:3000/api-docs
# PgAdmin:   http://localhost:5050  (admin@company.com / admin123)
```

### Default Login Credentials

```
Employee ID : EMP001
Email       : admin@company.com
Password    : Password@123
```

---

## 💻 Frontend Setup (Manual)

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Set VITE_API_BASE_URL=http://localhost:3000/api/v1

# Start development server (http://localhost:3001)
npm run dev

# Type check
npm run type-check

# Lint
npm run lint

# Production build
npm run build

# Preview production build
npm run preview
```

### Frontend Pages & Features

| Page | URL | Features |
|---|---|---|
| **Login** | `/login` | Employee ID + Email + Password, Remember Me, Forgot Password |
| **Dashboard** | `/dashboard` | 6 KPI cards, Bar/Pie/Line charts, SDLC phase breakdown, filters |
| **Projects** | `/projects` | Table with search/filter/pagination, CRUD modals |
| **Project Detail** | `/projects/:id` | Tabs: Overview, Team Members, PM History |
| **Employees** | `/employees` | Role-coded list with search and role filter chips |
| **Sprints** | `/sprints` | List with timeline countdown, status filter, CRUD |
| **Jira Stories** | `/jira` | Multi-filter table, Jira sync button, story detail page |
| **AI Usage** | `/ai-usage` | Log & track AI usage per task (9 SDLC phases) |
| **Excel Export** | `/excel` | Download 2-sheet XLSX report, upload import, column preview |

---

## ⚙️ Backend Setup (Manual)

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env — fill in DB credentials and JWT secrets

# Run database migrations (creates all tables)
npm run db:migrate

# Seed sample data
npm run db:seed

# Start development server (hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### API Endpoints Reference

| Module | Method | Endpoint |
|---|---|---|
| **Auth** | POST | `/api/v1/auth/login` |
| | POST | `/api/v1/auth/register` |
| | POST | `/api/v1/auth/refresh` |
| | POST | `/api/v1/auth/logout` |
| | GET | `/api/v1/auth/profile` |
| **Projects** | GET/POST | `/api/v1/projects` |
| | GET/PUT/DELETE | `/api/v1/projects/:id` |
| | POST | `/api/v1/projects/manager/assign` |
| | GET | `/api/v1/projects/manager/history/:id` |
| | POST | `/api/v1/projects/employee/assign` |
| | GET | `/api/v1/projects/employee/team/:id` |
| **Employees** | GET | `/api/v1/employees` |
| | GET/PUT/DELETE | `/api/v1/employees/:id` |
| **Sprints** | GET/POST | `/api/v1/sprints` |
| | GET/PUT/DELETE | `/api/v1/sprints/:id` |
| **Jira** | GET/POST | `/api/v1/jira` |
| | GET/PUT | `/api/v1/jira/:id` |
| | POST | `/api/v1/jira/sync` |
| **AI Usage** | GET/POST | `/api/v1/ai-usage` |
| | GET/PUT/DELETE | `/api/v1/ai-usage/:id` |
| | GET | `/api/v1/ai-usage/stats/summary` |
| | GET | `/api/v1/ai-usage/stats/by-phase` |
| **Dashboard** | GET | `/api/v1/dashboard/stats` |
| | GET | `/api/v1/dashboard/ai-usage-by-project` |
| | GET | `/api/v1/dashboard/effort-by-sprint` |
| | GET | `/api/v1/dashboard/resource-utilization` |
| **Excel** | GET | `/api/v1/excel/export/ai-report` |
| | POST | `/api/v1/excel/import` |

---

## 🔧 Environment Variables

### Backend (`backend/.env`)

```env
# Server
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ai_productivity_db
DB_USER=postgres
DB_PASSWORD=your_password
DB_SSL=false
DB_POOL_MIN=2
DB_POOL_MAX=10

# JWT
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars
JWT_REFRESH_EXPIRES_IN=30d

# Jira Integration (optional)
JIRA_BASE_URL=https://your-domain.atlassian.net
JIRA_EMAIL=you@company.com
JIRA_API_TOKEN=your_jira_api_token
JIRA_PROJECT_KEY=CON

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# CORS
CORS_ORIGIN=http://localhost:3001
```

### Frontend (`frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_APP_NAME=AI Productivity Tracking System
VITE_APP_VERSION=1.0.0
```

---

## 📚 API Documentation

Interactive Swagger UI is available once the backend is running:

```
http://localhost:3000/api-docs
```

Features:
- Browse all endpoints grouped by module
- JWT Bearer authentication support
- Try-it-out for every endpoint
- Request/response schema definitions

---

## 🗄️ Database Schema

| Table | Description |
|---|---|
| `employees` | Users with roles: Admin, PM, Developer, QA, BA, Architect |
| `projects` | Project master with status lifecycle |
| `project_manager_mapping` | PM assignments with full history |
| `employee_project_mapping` | Employee–project–role assignments |
| `sprints` | Sprint planning with Jira Sprint ID support |
| `jira_user_stories` | Story tracking synced from Jira API |
| `ai_usage_tracking` | Complete AI metrics: effort, coverage, accuracy per task |
| `audit_logs` | System-wide audit trail for all changes |
| `refresh_tokens` | JWT refresh token store with revocation support |

All tables include `created_at` / `updated_at` timestamps managed by PostgreSQL triggers.

---

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run with coverage report
npm run test:coverage

# Coverage output → backend/coverage/
```

**What's tested:**
- Auth API — login validation, protected routes, token refresh
- Project API — CRUD operations, permission guards
- Excel service — XLSX buffer generation with sample data

### Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Run with coverage
npm run test:coverage
```

**What's tested:**
- Redux slice reducers and state transitions
- Utility helper functions (formatDate, formatPercent, etc.)
- API error extraction

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflows

**`ci-backend.yml`** — triggered on push/PR to `backend/**`

1. Spin up a PostgreSQL 15 service container
2. Install dependencies (`npm ci`)
3. Run ESLint
4. Compile TypeScript (`npm run build`)
5. Run tests with coverage
6. Build and push Docker image to DockerHub (on `main` only)

**`ci-frontend.yml`** — triggered on push/PR to `frontend/**`

1. Install dependencies
2. TypeScript type-check
3. ESLint
4. Production build (`npm run build`)
5. Upload build artifact
6. Build and push Docker image (on `main` only)

### Required GitHub Secrets

| Secret | Description |
|---|---|
| `DOCKERHUB_USERNAME` | Docker Hub username |
| `DOCKERHUB_TOKEN` | Docker Hub access token |
| `DB_PASSWORD` | PostgreSQL password for CI |
| `JWT_SECRET` | JWT signing secret |

---

## 🐳 Docker Deployment

### Development / Staging

```bash
# Start all services (builds images if needed)
docker-compose up -d --build

# View running services
docker-compose ps

# Follow backend logs
docker-compose logs -f backend

# Follow frontend logs
docker-compose logs -f frontend

# Stop all services
docker-compose down

# Stop and remove volumes (full reset)
docker-compose down -v
```

### Services Map

| Service | Container | Port | URL |
|---|---|---|---|
| **Frontend** (Nginx) | `ai_productivity_frontend` | 80 | http://localhost |
| **Backend** (Node.js) | `ai_productivity_backend` | 3000 | http://localhost:3000 |
| **PostgreSQL** | `ai_productivity_db` | 5432 | localhost:5432 |
| **PgAdmin** | `ai_productivity_pgadmin` | 5050 | http://localhost:5050 |

---

## 🚢 Production Deployment

### Frontend

```bash
cd frontend

# Build optimised production bundle
npm run build

# Output is in frontend/dist/
# Deploy dist/ to any static host: Vercel, Netlify, S3, Nginx
```

### Backend (PM2)

```bash
cd backend

# Build TypeScript
npm run build

# Install PM2 globally
npm install -g pm2

# Start with cluster mode
pm2 start dist/server.js \
  --name "ai-productivity-api" \
  --instances max \
  --env production

pm2 save
pm2 startup
```

### Production Checklist

- [ ] Set `NODE_ENV=production` in backend
- [ ] Use strong random values for `JWT_SECRET` and `JWT_REFRESH_SECRET` (≥ 32 chars)
- [ ] Set `DB_SSL=true` for PostgreSQL
- [ ] Configure `CORS_ORIGIN` to your frontend domain
- [ ] Set `VITE_API_BASE_URL` to your production API URL before building frontend
- [ ] Set up Nginx reverse proxy for the backend (HTTPS + SSL)
- [ ] Enable log rotation for backend logs
- [ ] Set up monitoring (Datadog, New Relic, or Prometheus + Grafana)
- [ ] Configure automated database backups

---

## 📊 Modules Summary

| # | Module | Description | Key Features |
|---|---|---|---|
| 1 | **Authentication** | JWT-based login system | Employee ID + Email + Password, Remember Me, Forgot Password, Role-based access |
| 2 | **Dashboard** | Analytics overview | 6 KPI cards, Bar/Pie/Line charts, SDLC phase breakdown, Project/Sprint filters |
| 3 | **Project Management** | Full project lifecycle | CRUD, search, pagination, sort, status tracking |
| 4 | **PM Mapping** | Project manager assignment | Assign/change PM, full assignment history |
| 5 | **Employee Mapping** | Team management | Assign employees with roles (Dev/QA/BA/Architect/PM), remove, history |
| 6 | **Sprint Management** | Sprint planning | CRUD, Jira Sprint ID, status tracking, timeline countdown |
| 7 | **Jira Stories** | User story management | CRUD, multi-filter table, Jira REST API sync, acceptance criteria |
| 8 | **AI Usage Tracking** | Core AI productivity module | 9 SDLC phases, effort saved auto-calc, coverage %, accuracy %, TrueSDLC metrics |
| 9 | **Excel Export** | Reporting | 2-sheet XLSX (AI Summary + Detailed Metrics), import, sample data |

---

## 🎨 UI Features

- **Responsive design** — Works on desktop, tablet and mobile browsers
- **Dark / Light mode** — Toggle via navbar, persisted in localStorage
- **Collapsible sidebar** — Expand/collapse navigation panel
- **Data tables** — Sortable, paginated, with skeleton loading states
- **Modal forms** — All CRUD operations in slide-up modals with validation
- **Toast notifications** — Success/error feedback for every action
- **Search & filters** — Debounced search + multi-filter dropdowns on all list pages

---

## 📄 License

MIT License — Copyright © 2025 AI Productivity Team
