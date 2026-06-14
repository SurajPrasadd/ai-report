# 🤖 AI Productivity Tracking System

A full-stack mobile application for tracking AI usage across SDLC activities, managing projects, sprints, Jira user stories, and generating productivity reports.

---

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Quick Start (Docker)](#quick-start-docker)
- [Backend Setup](#backend-setup)
- [Mobile App Setup](#mobile-app-setup)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Modules](#modules)
- [Database Schema](#database-schema)
- [Testing](#testing)
- [Deployment](#deployment)

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    React Native App (Mobile)                 │
│  Redux Toolkit │ React Navigation │ React Hook Form │ Axios │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS / REST API
┌────────────────────────▼────────────────────────────────────┐
│                    Node.js + Express API                     │
│    TypeScript │ JWT Auth │ Rate Limiting │ Swagger          │
├─────────────────────────────────────────────────────────────┤
│            Controller → Service → Repository                │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                     PostgreSQL 15                            │
│   projects │ employees │ sprints │ jira_stories │ ai_usage  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📂 Project Structure

```
ai-productivity-system/
├── backend/                     # Node.js + Express API
│   ├── src/
│   │   ├── config/              # DB, env configs
│   │   ├── database/            # Schema + seed SQL
│   │   ├── middleware/          # Auth, error, validation, audit
│   │   ├── modules/
│   │   │   ├── auth/            # Login, register, JWT
│   │   │   ├── project/         # CRUD + PM/employee mapping
│   │   │   ├── employee/        # Employee management
│   │   │   ├── sprint/          # Sprint CRUD
│   │   │   ├── jira/            # Story CRUD + Jira sync
│   │   │   ├── ai-usage/        # AI tracking + stats
│   │   │   ├── dashboard/       # Analytics aggregation
│   │   │   └── excel/           # XLSX export/import
│   │   ├── swagger/             # API docs
│   │   ├── utils/               # Logger, response helpers
│   │   └── server.ts            # Entry point
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── mobile/                      # React Native App
│   ├── src/
│   │   ├── components/common/   # Reusable UI components
│   │   ├── navigation/          # Stack, drawer navigators
│   │   ├── screens/
│   │   │   ├── auth/            # Login, ForgotPassword
│   │   │   ├── dashboard/       # Charts + KPI cards
│   │   │   ├── project/         # CRUD + mapping screens
│   │   │   ├── employee/        # Employee list
│   │   │   ├── sprint/          # Sprint management
│   │   │   ├── jira/            # Story management
│   │   │   ├── ai-usage/        # AI usage logging
│   │   │   └── excel/           # Export screen
│   │   ├── store/
│   │   │   ├── slices/          # Auth, projects, sprints, jira, AI, dashboard, theme
│   │   │   └── index.ts         # Redux store + persist
│   │   ├── services/            # Axios instance + interceptors
│   │   ├── theme/               # Light/dark colors + typography
│   │   ├── types/               # TypeScript types
│   │   └── utils/               # Helpers + constants
│   └── App.tsx
│
├── docker-compose.yml
└── .github/workflows/           # CI/CD
```

---

## ✅ Prerequisites

- **Node.js** 20+ 
- **PostgreSQL** 15+
- **React Native** CLI environment ([Setup Guide](https://reactnative.dev/docs/environment-setup))
- **Android Studio** / **Xcode** for mobile development
- **Docker** & **Docker Compose** (for containerized setup)

---

## 🚀 Quick Start (Docker)

```bash
# Clone and navigate
git clone <repo-url>
cd ai-productivity-system

# Create environment file
cp backend/.env.example backend/.env
# Edit backend/.env with your settings

# Start all services
docker-compose up -d

# Services running:
# API:     http://localhost:3000
# Swagger: http://localhost:3000/api-docs
# PgAdmin: http://localhost:5050
```

---

## ⚙️ Backend Setup (Manual)

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# Run database migrations
npm run db:migrate

# Seed sample data
npm run db:seed

# Start development server
npm run dev

# Build for production
npm run build
npm start
```

### Backend API Endpoints

| Module      | Endpoints |
|-------------|-----------|
| Auth        | POST /auth/login, /register, /refresh, /logout, GET /profile |
| Projects    | GET,POST /projects, GET,PUT,DELETE /projects/:id |
| PM Mapping  | POST /projects/manager/assign, GET /projects/manager/history/:id |
| Emp Mapping | POST /projects/employee/assign, DELETE /projects/employee/:empId/:projId |
| Employees   | GET /employees, GET,PUT,DELETE /employees/:id |
| Sprints     | GET,POST /sprints, GET,PUT,DELETE /sprints/:id |
| Jira        | GET,POST /jira, GET,PUT /jira/:id, POST /jira/sync |
| AI Usage    | GET,POST /ai-usage, GET,PUT,DELETE /ai-usage/:id, GET /ai-usage/stats/summary |
| Dashboard   | GET /dashboard/stats, /ai-usage-by-project, /effort-by-sprint, /resource-utilization |
| Excel       | GET /excel/export/ai-report, POST /excel/import |

---

## 📱 Mobile App Setup

```bash
cd mobile

# Install dependencies
npm install

# iOS only
cd ios && pod install && cd ..

# Android: Start emulator or connect device, then:
npm run android

# iOS:
npm run ios

# Start Metro bundler
npm start
```

### Default Login Credentials

```
Employee ID: EMP001
Email:       admin@company.com
Password:    Password@123
```

> **Note:** Update `src/utils/constants.ts` with your backend URL:
> - Android emulator: `http://10.0.2.2:3000/api/v1`
> - iOS simulator:    `http://localhost:3000/api/v1`
> - Physical device:  `http://<your-machine-ip>:3000/api/v1`

---

## 🔧 Environment Variables

```env
# Backend (.env)
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ai_productivity_db
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_jwt_secret_min_32_chars
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=30d

JIRA_BASE_URL=https://your-domain.atlassian.net
JIRA_EMAIL=you@company.com
JIRA_API_TOKEN=your_jira_token
```

---

## 📚 API Documentation

Swagger UI available at: `http://localhost:3000/api-docs`

Features:
- Interactive API explorer
- JWT Bearer auth support
- Request/response schemas
- Try-it-out for all endpoints

---

## 🗄️ Database Schema

**Core Tables:**
- `employees` — Users with roles (Admin, PM, Developer, QA, BA, Architect)
- `projects` — Project master with status tracking
- `project_manager_mapping` — PM assignment with history
- `employee_project_mapping` — Employee-project-role assignments
- `sprints` — Sprint management with Jira sync
- `jira_user_stories` — Story tracking with sync support
- `ai_usage_tracking` — Full AI metrics per story/task
- `audit_logs` — System-wide audit trail
- `refresh_tokens` — JWT refresh token storage

---

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test
npm run test:coverage

# Mobile tests
cd mobile
npm test
```

**Test Coverage:**
- Auth API (login, register, protected routes)
- Project CRUD operations
- Excel generation with XLSX
- Redux slice state management
- Utility helper functions

---

## 🐳 Docker Deployment

```bash
# Production deployment
docker-compose -f docker-compose.yml up -d --build

# View logs
docker-compose logs -f backend

# Scale backend
docker-compose up -d --scale backend=3
```

---

## 🚢 Production Deployment

### Backend (PM2)

```bash
cd backend
npm run build

# Using PM2
npm install -g pm2
pm2 start dist/server.js --name "ai-productivity-api" --instances max
pm2 save
pm2 startup
```

### React Native (Release Build)

```bash
# Android APK/AAB
cd mobile
cd android && ./gradlew bundleRelease

# iOS (via Xcode)
# Product → Archive → Distribute App
```

### Environment Checklist for Production

- [ ] Change JWT secrets to strong random values
- [ ] Set `NODE_ENV=production`
- [ ] Enable SSL for PostgreSQL (`DB_SSL=true`)
- [ ] Configure CORS origins
- [ ] Set up Nginx reverse proxy
- [ ] Enable HTTPS with SSL certificate
- [ ] Configure monitoring (e.g., Datadog, New Relic)
- [ ] Set up log rotation

---

## 🔄 CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/ci-backend.yml`):

1. **Test** — Lint, type-check, run tests with coverage
2. **Build** — Compile TypeScript
3. **Docker** — Build and push Docker image
4. **Deploy** — Deploy to production (configure secrets)

**Required GitHub Secrets:**
- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`
- `DB_PASSWORD`
- `JWT_SECRET`

---

## 📊 Modules Summary

| # | Module | Features |
|---|--------|----------|
| 1 | Authentication | Login, Forgot Password, JWT, Remember Me, Role-based access |
| 2 | Dashboard | KPI cards, Bar charts, Pie charts, Filters |
| 3 | Project Management | CRUD, Search, Pagination, Sort |
| 4 | PM Mapping | Assign/change PM, History tracking |
| 5 | Employee Mapping | Assign roles, Remove, History |
| 6 | Sprint Management | CRUD, Status tracking, Jira sync |
| 7 | Jira Stories | CRUD, Import from Jira API, Sync |
| 8 | AI Usage Tracking | 9 SDLC phases, Effort metrics, Coverage/Accuracy |
| 9 | Excel Export | 2-sheet report with all metrics, sample data |

---

## 📄 License

MIT License — Copyright © 2024 AI Productivity Team
