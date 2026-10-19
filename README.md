# Support Ticket Management System

An enterprise-grade, full-stack **Support Ticket Management System** designed for high-efficiency customer support teams and IT service desks. The platform features strict role-based access control (**ADMIN** and **SUPPORT_AGENT**), real-time live ticket discussions powered by **Socket.IO**, and operational intelligence analytics visualized with **Recharts**.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture & Tech Stack](#architecture--tech-stack)
  - [Backend Stack](#backend-stack)
  - [Frontend Stack](#frontend-stack)
  - [Database Architecture](#database-architecture)
- [Folder & Directory Structure](#folder--directory-structure)
- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
  - [Backend Configuration (`.env`)](#backend-configuration-env)
  - [Frontend Configuration (`.env`)](#frontend-configuration-env)
- [Database Setup & Migrations](#database-setup--migrations)
  - [Default Seeded Credentials](#default-seeded-credentials)
- [Installation & Running the Project](#installation--running-the-project)
  - [1. Backend Setup (Development)](#1-backend-setup-development)
  - [2. Frontend Setup (Development)](#2-frontend-setup-development)
  - [3. Production Build & Deployment](#3-production-build--deployment)
- [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
- [REST API Documentation](#rest-api-documentation)
  - [Authentication Endpoints (`/api/auth`)](#authentication-endpoints-apiauth)
  - [Tickets Endpoints (`/api/tickets`)](#tickets-endpoints-apitickets)
  - [Comments Endpoints (`/api/tickets/:ticketId/comments`)](#comments-endpoints-apiticketsticketidcomments)
  - [Dashboard & Analytics Endpoints (`/api/dashboard`)](#dashboard--analytics-endpoints-apidashboard)
  - [System Root Endpoint (`/api`)](#system-root-endpoint-api)
- [Real-Time WebSocket Protocol (Socket.IO)](#real-time-websocket-protocol-socketio)
  - [Gateway & Connection Setup](#gateway--connection-setup)
  - [Client-to-Server Events](#client-to-server-events)
  - [Server-to-Client Broadcasts](#server-to-client-broadcasts)
- [Dashboard Analytics & Data Visualization](#dashboard-analytics--data-visualization)
- [Testing & Quality Assurance](#testing--quality-assurance)
- [Troubleshooting & FAQs](#troubleshooting--faqs)
- [Security Best Practices](#security-best-practices)

---

## Overview

The **Support Ticket Management System** enables organizations to organize, prioritize, track, and resolve customer and internal support issues. It enforces strict separation of concerns between managers (**ADMIN**) and service representatives (**SUPPORT_AGENT**):

- **Administrators** control the entire lifecycle: creating tickets, assigning agents, adjusting deadlines/priorities, monitoring system-wide analytics, managing team workload, and archiving/deleting tickets.
- **Support Agents** work through an optimized, distraction-free inbox: viewing assigned workload, transitioning statuses from `OPEN` to `IN_PROGRESS` and `RESOLVED`, adding notes and responses, and participating in live customer/team discussions.

Both parties collaborate seamlessly on active tickets with real-time bidirectional messaging, live typing indicators, and immediate notification updates without manual page refreshes.

---

## Key Features

### 1. Robust Authentication & Role Separation
- Secure registration and login using **JWT** (JSON Web Tokens) and **Bcrypt** password hashing (10 salt rounds).
- Global NestJS `JwtAuthGuard` and `RolesGuard` applied across all controller routes by default, with opt-out `@Public()` decorator for unauthenticated endpoints.
- Scoped data access: Admins only manage tickets they oversee; Agents are isolated strictly to tickets assigned to their account.

### 2. Comprehensive Ticket Lifecycle Management
- **Priorities**: `LOW`, `MEDIUM`, `HIGH`, `URGENT` (color-coded badges).
- **Statuses**: `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`.
- Due date tracking with automatic overdue calculation against configurable SLA thresholds (Urgent: 4h, High: 12h, Medium: 24h, Low: 48h).
- Automatic timestamping: `resolvedAt` is stamped when status changes to `RESOLVED` or `CLOSED`, and cleared if reopened.
- Rich search and filtering: full-text search across titles and descriptions, filtered by status, priority, or assignee, with configurable pagination and sorting.

### 3. Real-Time Interactive Discussions (Socket.IO)
- Dedicated WebSocket namespace `/comments` with JWT handshake authentication.
- Room isolation per ticket (`ticket:<ticketId>`).
- Instant bi-directional messaging: comment creation, in-place edits, and comment deletions broadcast instantaneously to all peers in the ticket room.
- Live typing presence: displays real-time `[Agent/Admin Name] is typing...` indicators with debounced timeouts.
- Redux-backed optimistic sync and socket reconnection handlers.

### 4. Executive Analytics & Operational Metrics (Recharts)
- **Ticket Volume Trends**: Area chart visualizing created vs. resolved tickets over selectable timeframes (`7d`, `30d`, `90d`, `all`).
- **Priority Distribution**: Donut/Pie chart highlighting severity breakdown (`LOW`, `MEDIUM`, `HIGH`, `URGENT`).
- **Status & SLA Breakdown**: Bar charts displaying resolved vs. unresolved tickets, average turnaround hours, and SLA compliance percentages.
- **Agent Workload Grid**: Multi-bar workload comparison tracking assigned, open, in-progress, resolved, and overdue tickets per team member.

---

## Architecture & Tech Stack

```mermaid
graph TD
    Client["React 19 + Redux Toolkit Client<br/>(Webpack 5 @ Port 5173)"]
    API["NestJS 12 REST API & Gateway<br/>(Express + Socket.IO @ Port 3000)"]
    DB[(PostgreSQL Database<br/>Prisma ORM 6)]

    Client -->|HTTP /api Requests (JWT Bearer)| API
    Client <-->|WebSocket /comments (Socket.IO)| API
    API -->|Prisma Client| DB
```

### Backend Stack
- **Runtime & Framework**: [Node.js](https://nodejs.org/) (v18+ recommended) with [NestJS 12](https://nestjs.com/)
- **Language**: TypeScript 6
- **ORM & Database Client**: [Prisma ORM 6](https://www.prisma.io/)
- **Database Engine**: [PostgreSQL](https://www.postgresql.org/)
- **Authentication**: Passport.js (`passport-jwt`), NestJS JWT (`@nestjs/jwt`), `bcrypt`
- **Real-Time WebSockets**: NestJS WebSockets (`@nestjs/websockets`, `@nestjs/platform-socket.io`, `socket.io` v4.8)
- **Validation & Transformation**: `class-validator`, `class-transformer`
- **Testing & Tooling**: Jest 30, ts-jest, Supertest, Oxlint (`oxlint`), Prettier

### Frontend Stack
- **Framework & Core**: [React 19](https://react.dev/), [React DOM 19](https://react.dev/)
- **Language**: TypeScript 7
- **Bundler & Dev Server**: [Webpack 5](https://webpack.js.org/) (`webpack-dev-server`, Babel 8)
- **State Management**: [Redux Toolkit 2](https://redux-toolkit.js.org/) (`@reduxjs/toolkit`, `react-redux`)
- **Routing**: [React Router 7](https://reactrouter.com/)
- **Styling**: [Tailwind CSS 3](https://tailwindcss.com/) with PostCSS & Autoprefixer
- **Charts & Visualization**: [Recharts 3](https://recharts.org/)
- **Icons & Notifications**: [Lucide React](https://lucide.dev/), [React Hot Toast](https://react-hot-toast.com/)
- **HTTP & Socket Clients**: [Axios 1](https://axios-http.com/), [Socket.IO Client 4](https://socket.io/)

### Database Architecture

The PostgreSQL database is managed via Prisma with 3 core models and 3 enums:

```mermaid
erDiagram
    User ||--o{ Ticket : "createdTickets (createdById)"
    User ||--o{ Ticket : "assignedTickets (assignedToId)"
    User ||--o{ Comment : "author (authorId)"
    Ticket ||--o{ Comment : "comments (ticketId)"

    User {
        String id PK "cuid()"
        String name
        String email UK
        String password
        Role role "ADMIN | SUPPORT_AGENT"
        DateTime createdAt
        DateTime updatedAt
    }

    Ticket {
        String id PK "cuid()"
        String title
        String description
        TicketPriority priority "LOW | MEDIUM | HIGH | URGENT"
        TicketStatus status "OPEN | IN_PROGRESS | RESOLVED | CLOSED"
        String createdById FK
        String assignedToId FK "nullable"
        DateTime dueDate "nullable"
        DateTime resolvedAt "nullable"
        DateTime createdAt
        DateTime updatedAt
    }

    Comment {
        String id PK "cuid()"
        String content "Text"
        String ticketId FK
        String authorId FK
        DateTime createdAt
        DateTime updatedAt
    }
```

---

## Folder & Directory Structure

```text
support-ticket-system/
├── README.md                          # Comprehensive project documentation
│
├── backend/                           # NestJS backend application
│   ├── prisma/
│   │   ├── migrations/                # Prisma database migration SQL files
│   │   ├── schema.prisma              # Database schema models & enums
│   │   └── seed.ts                    # Database seeder (Admin & Agent accounts)
│   ├── src/
│   │   ├── common/                    # Global cross-cutting concerns
│   │   │   ├── constants/             # Enums (roles, ticket-status, priority)
│   │   │   ├── decorators/            # @Public(), @Roles(), @GetUser()
│   │   │   ├── filters/               # AllExceptionsFilter (HttpException)
│   │   │   ├── guards/                # JwtAuthGuard, RolesGuard
│   │   │   ├── interceptors/          # LoggingInterceptor
│   │   │   └── pipes/                 # AppValidationPipe (whitelist/transform)
│   │   ├── config/                    # Configuration schema & loader
│   │   ├── database/                  # PrismaService & PrismaModule
│   │   ├── helpers/                   # SLA metrics, date helpers, color helpers
│   │   ├── modules/
│   │   │   ├── auth/                  # Auth module, JWT strategies, auth controller/service
│   │   │   │   ├── dto/               # LoginDto, RegisterDto, AuthResponseDto
│   │   │   │   └── strategies/        # JwtStrategy
│   │   │   ├── tickets/               # Tickets CRUD, role enforcement, filtering
│   │   │   │   └── dto/               # CreateTicketDto, UpdateTicketDto, QueryTicketsDto
│   │   │   ├── comments/              # Comments CRUD & Socket.IO Gateway
│   │   │   │   ├── dto/               # CreateCommentDto, UpdateCommentDto
│   │   │   │   ├── comments.gateway.ts# WebSocket gateway for /comments
│   │   │   │   └── comments.service.ts# Comment business logic & broadcast triggers
│   │   │   └── dashboard/             # Statistics, analytics aggregations & SLAs
│   │   │       └── dto/               # DashboardStatsDto, DashboardAnalyticsDto
│   │   ├── utils/                     # Pagination utilities, bcrypt password util
│   │   ├── app.controller.ts          # Health/root endpoint (/api)
│   │   ├── app.module.ts              # Root NestJS application module
│   │   └── main.ts                    # Application bootstrapper, CORS & prefix configuration
│   ├── test/                          # End-to-end (e2e) test suites
│   ├── .env                           # Backend environment variables
│   ├── .env.example                   # Example environment configuration
│   ├── nest-cli.json                  # Nest CLI build configuration
│   ├── package.json                   # Backend dependencies & npm scripts
│   ├── prisma.config.ts               # Prisma CLI configuration
│   └── tsconfig.json                  # Backend TypeScript configuration
│
└── frontend/                          # React 19 single-page application
    ├── public/
    ├── src/
    │   ├── api/                       # Axios instance, interceptors, API client methods
    │   │   ├── axios.ts               # Configured Axios client with baseURL /api
    │   │   ├── endpoints.ts           # Route endpoint constants dictionary
    │   │   └── interceptor.ts         # JWT bearer injection & 401 dispatch
    │   ├── components/                # Reusable UI component library
    │   │   ├── common/                # Buttons, Modals, Inputs, Badges, Tables, Cards
    │   │   └── layout/                # Header, Sidebar, Footer, MainLayout
    │   ├── features/                  # Domain-specific feature modules
    │   │   ├── comments/              # CommentList, CommentItem, CommentForm, CommentsSection
    │   │   ├── dashboard/             # Recharts visualizations & summary widgets
    │   │   │   ├── AdminDashboardView.tsx
    │   │   │   ├── AgentDashboardView.tsx
    │   │   │   ├── TicketsTrendChart.tsx
    │   │   │   ├── PriorityDistributionChart.tsx
    │   │   │   ├── ResolvedVsUnresolvedChart.tsx
    │   │   │   └── AgentWorkloadChart.tsx
    │   │   └── tickets/               # CreateTicketModal, EditTicketModal, TicketFilterBar
    │   ├── hooks/                     # Custom React hooks (useAuth, useTicketCommentsSocket)
    │   ├── layouts/                   # AuthLayout, DashboardLayout
    │   ├── pages/                     # Routed view components
    │   │   ├── Dashboard/             # DashboardPage (switches by role)
    │   │   ├── Login/                 # LoginPage
    │   │   ├── Register/              # RegisterPage
    │   │   ├── Tickets/               # TicketsListPage, TicketDetailPage, CreateTicketPage
    │   │   ├── NotFound/              # NotFoundPage (404)
    │   │   └── Unauthorized/          # UnauthorizedPage (403)
    │   ├── redux/                     # Redux Toolkit store & slices
    │   │   ├── auth/                  # authSlice & authThunks
    │   │   ├── tickets/               # ticketsSlice & ticketsThunks
    │   │   ├── comments/              # commentsSlice & commentsThunks
    │   │   └── users/                 # usersSlice & usersThunks
    │   ├── routes/                    # AppRoutes, ProtectedRoute, PublicRoute, RouteConstants
    │   ├── services/                  # Socket.IO client service, auth & ticket wrappers
    │   ├── types/                     # TypeScript interfaces (auth, ticket, comment, dashboard)
    │   ├── utils/                     # Formatting, token storage, date helpers
    │   ├── App.tsx                    # Root component with Toast & Router providers
    │   └── main.tsx                   # React 19 entry point
    ├── .env                           # Frontend environment variables
    ├── index.html                     # HTML template
    ├── package.json                   # Frontend dependencies & npm scripts
    ├── tailwind.config.js             # Tailwind design tokens & theme configuration
    ├── tsconfig.json                  # Frontend TypeScript configuration
    └── webpack.config.js              # Webpack dev server & asset bundler config
```

---

## Prerequisites

Before starting, ensure you have the following installed on your operating system:

1. **Node.js**: v18.0.0 or higher (v20+ recommended)
   ```bash
   node --version
   ```
2. **npm**: v9.0.0 or higher
   ```bash
   npm --version
   ```
3. **PostgreSQL**: v13 or higher running locally or accessible remotely
   ```bash
   psql --version
   ```

---

## Environment Configuration

Both the frontend and backend require environment variable files.

### Backend Configuration (`.env`)

Create `backend/.env` (or copy from `backend/.env.example`):

```bash
# Database connection string (PostgreSQL)
DATABASE_URL="postgresql://postgres:admin123@localhost:5432/support_ticket_db?schema=public"

# JWT signing secret (use a strong random string in production)
JWT_SECRET="replace-with-a-long-random-secret"

# JWT validity duration
JWT_EXPIRES_IN="1d"

# Backend HTTP service port
PORT=3000

# Allowed Frontend URL for CORS and WebSocket handshake
FRONTEND_URL="http://localhost:5173"
```

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection URL with credentials, host, port, database, and schema | `postgresql://postgres:admin123@localhost:5432/support_ticket_db?schema=public` |
| `JWT_SECRET` | Secret key used to sign and verify JSON Web Tokens | `replace-with-a-long-random-secret` |
| `JWT_EXPIRES_IN` | Token expiration time format | `1d` |
| `PORT` | Local port for NestJS HTTP server and WebSocket gateway | `3000` |
| `FRONTEND_URL` | Trusted origin allowed for CORS requests and WebSocket connections | `http://localhost:5173` |

### Frontend Configuration (`.env`)

Create `frontend/.env`:

```bash
# Backend REST API base URL
REACT_APP_API_URL=http://localhost:3000
```

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `REACT_APP_API_URL` | Base URL pointing to the NestJS backend (Axios automatically appends `/api`) | `http://localhost:3000` |

---

## Database Setup & Migrations

### 1. Create the PostgreSQL Database

Make sure PostgreSQL is running, then create the database:

```sql
CREATE DATABASE support_ticket_db;
```

### 2. Generate Prisma Client & Run Migrations

From the `backend/` directory:

```bash
cd backend

# Generate the Prisma client from schema.prisma
npx prisma generate

# Apply migrations to database (or synchronize schema)
npx prisma migrate dev --name init
# Alternatively for rapid prototyping:
# npx prisma db push
```

### 3. Seed Initial Accounts

Populate the database with pre-configured Admin and Support Agent accounts:

```bash
npx prisma db seed
```

*(You can also run `npm run prisma:seed` if added to scripts, or execute `npx ts-node prisma/seed.ts` directly).*

### 4. Prisma Studio (Database GUI)

To inspect and manage records interactively in your browser:

```bash
npx prisma studio
```
Prisma Studio opens at `http://localhost:5555`.

### Default Seeded Credentials

| Role | Email | Password | Privileges |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@gmail.com` | `admin@123` | Full administrative control: create/delete tickets, assign agents, system-wide analytics, view all agent stats. |
| **SUPPORT_AGENT** | `agent@gmail.com` | `agent@123` | Agent portal: view assigned tickets, transition ticket status, post and manage own comments. |

---

## Installation & Running the Project

Follow these steps to configure and launch both services independently.

### 1. Backend Setup (Development)

Open a terminal and navigate to `backend/`:

```bash
cd backend

# 1. Install all dependencies
npm install

# 2. Ensure environment variables are set
# (Verify backend/.env contains valid DATABASE_URL and JWT_SECRET)

# 3. Synchronize database schema & seed users
npx prisma generate
npx prisma db push
npx prisma db seed

# 4. Start NestJS in development mode with auto-reload
npm run start:dev
```

The backend starts at:
- **REST API Base URL**: `http://localhost:3000/api`
- **Socket.IO Gateway**: `ws://localhost:3000/comments`

### 2. Frontend Setup (Development)

Open a second terminal and navigate to `frontend/`:

```bash
cd frontend

# 1. Install all dependencies
npm install

# 2. Ensure environment variables are set
# (Verify frontend/.env contains REACT_APP_API_URL=http://localhost:3000)

# 3. Start Webpack Dev Server with Hot Module Replacement
npm run dev
```

The frontend application starts at:
- **Application URL**: `http://localhost:5173`

Open `http://localhost:5173` in your browser and sign in using the seeded credentials.

---

### 3. Production Build & Deployment

#### Building and Running Backend in Production

```bash
cd backend

# 1. Compile TypeScript into dist/
npm run build

# 2. Run database migrations
npx prisma migrate deploy

# 3. Launch compiled server
npm run start:prod
# or: node dist/main
```

#### Building Frontend for Production

```bash
cd frontend

# 1. Perform TypeScript type-checking
npm run typecheck

# 2. Compile and optimize production static bundle into dist/
npm run build
```

The generated `frontend/dist/` bundle contains optimized HTML, CSS, and hashed JavaScript assets ready to be served via Nginx, Apache, AWS S3/CloudFront, Vercel, or a Docker container.

---

## Role-Based Access Control (RBAC)

The system implements strict permission matrices enforced at both the NestJS API layer (guards and query constraints) and the React frontend layer (route protection and UI controls):

| Action / Capability | ADMIN | SUPPORT_AGENT | Enforcement Detail |
| :--- | :---: | :---: | :--- |
| **Register & Login** | Yes | Yes | Unrestricted public endpoints (`/api/auth/login`, `/api/auth/register`). |
| **View Dashboard** | Yes (Executive View) | Yes (Agent Queue View) | Dynamic views rendered based on `user.role`. |
| **View System Analytics** | Full Analytics | Scoped to Assigned Work | Admin sees all team workload; Agent sees personal performance metrics. |
| **Create New Tickets** | Yes | No | Backend rejects Agent creations with `403 Forbidden`. |
| **View Tickets List** | Tickets created by Admin | Tickets assigned to Agent | Automatic database query filtering (`where.createdById` vs `where.assignedToId`). |
| **View Ticket Details** | Tickets created by Admin | Tickets assigned to Agent | `403 Forbidden` if agent accesses an unassigned ticket. |
| **Update Ticket Metadata** (Title, Desc, Priority, Assignee, Due Date) | Yes | No | Admin can edit all ticket attributes. |
| **Update Ticket Status** (`OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`) | Yes | Yes | Agent can only update status. Agents are blocked from reopening `CLOSED` tickets. |
| **Delete Tickets** | Yes | No | Only Admin can delete tickets created by them. |
| **Post Comments** | Yes | Yes | Permitted on accessible tickets. |
| **Edit / Delete Comments** | Author Only | Author Only | Users can only modify or delete comments authored by themselves. |
| **View Agent Directory** | Yes | No | Admin fetches full agent directory with current ticket counts. |

---

## REST API Documentation

All REST routes are prefixed with `/api`. Protected routes require the following header:
```http
Authorization: Bearer <your_jwt_access_token>
```

### Authentication Endpoints (`/api/auth`)

#### 1. Register User
- **Method**: `POST`
- **Path**: `/api/auth/register`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "name": "Sarah Connor",
    "email": "sarah@example.com",
    "password": "Password123!",
    "role": "SUPPORT_AGENT"
  }
  ```
  *(Note: `role` is optional and defaults to `SUPPORT_AGENT`. Accepted values: `ADMIN`, `SUPPORT_AGENT`).*
- **Response** (`201 Created`):
  ```json
  {
    "user": {
      "id": "cm7a1b2c3d4e5f6g7h8i9j0k",
      "name": "Sarah Connor",
      "email": "sarah@example.com",
      "role": "SUPPORT_AGENT",
      "createdAt": "2026-10-16T12:00:00.000Z",
      "updatedAt": "2026-10-16T12:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

#### 2. User Login
- **Method**: `POST`
- **Path**: `/api/auth/login`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "admin@gmail.com",
    "password": "admin@123"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "user": {
      "id": "cm7admin00001",
      "name": "System Administrator",
      "email": "admin@gmail.com",
      "role": "ADMIN",
      "createdAt": "2026-10-16T10:00:00.000Z",
      "updatedAt": "2026-10-16T10:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

#### 3. Get Current User Profile
- **Method**: `GET`
- **Path**: `/api/auth/me`
- **Access**: Authenticated (`ADMIN`, `SUPPORT_AGENT`)
- **Response** (`200 OK`):
  ```json
  {
    "id": "cm7admin00001",
    "name": "System Administrator",
    "email": "admin@gmail.com",
    "role": "ADMIN",
    "createdAt": "2026-10-16T10:00:00.000Z",
    "updatedAt": "2026-10-16T10:00:00.000Z"
  }
  ```

#### 4. Fetch Users List
- **Method**: `GET`
- **Path**: `/api/auth/users`
- **Access**: `ADMIN`
- **Query Parameters**:
  - `role` *(optional)*: `ADMIN` | `SUPPORT_AGENT`
- **Response** (`200 OK`):
  ```json
  [
    {
      "id": "cm7agent00001",
      "name": "Alex Agent",
      "email": "agent@gmail.com",
      "role": "SUPPORT_AGENT",
      "createdAt": "2026-10-16T10:00:00.000Z",
      "updatedAt": "2026-10-16T10:00:00.000Z",
      "assignedTicketCount": 5,
      "inProgressTicketCount": 2
    }
  ]
  ```

---

### Tickets Endpoints (`/api/tickets`)

#### 1. Create a Ticket
- **Method**: `POST`
- **Path**: `/api/tickets`
- **Access**: `ADMIN` only
- **Request Body**:
  ```json
  {
    "title": "Payment gateway timeout on checkout",
    "description": "Users reporting 504 errors when processing transactions via Stripe webhook.",
    "priority": "HIGH",
    "assignedToId": "cm7agent00001",
    "dueDate": "2026-10-20T18:00:00.000Z"
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "id": "cm7ticket0001",
    "title": "Payment gateway timeout on checkout",
    "description": "Users reporting 504 errors when processing transactions via Stripe webhook.",
    "priority": "HIGH",
    "status": "OPEN",
    "createdById": "cm7admin00001",
    "assignedToId": "cm7agent00001",
    "dueDate": "2026-10-20T18:00:00.000Z",
    "resolvedAt": null,
    "createdAt": "2026-10-16T13:00:00.000Z",
    "updatedAt": "2026-10-16T13:00:00.000Z",
    "createdBy": {
      "id": "cm7admin00001",
      "name": "System Administrator",
      "email": "admin@gmail.com",
      "role": "ADMIN"
    },
    "assignedTo": {
      "id": "cm7agent00001",
      "name": "Alex Agent",
      "email": "agent@gmail.com",
      "role": "SUPPORT_AGENT"
    }
  }
  ```

#### 2. Get All Tickets (Paginated & Filtered)
- **Method**: `GET`
- **Path**: `/api/tickets`
- **Access**: Authenticated (`ADMIN` receives tickets created by them; `SUPPORT_AGENT` receives tickets assigned to them)
- **Query Parameters**:
  - `status` *(optional)*: `OPEN` | `IN_PROGRESS` | `RESOLVED` | `CLOSED`
  - `priority` *(optional)*: `LOW` | `MEDIUM` | `HIGH` | `URGENT`
  - `search` *(optional)*: Partial match against title or description
  - `assignedToId` *(optional, Admin only)*: Filter by assigned agent ID
  - `page` *(optional, default: `1`)*: Page number
  - `limit` *(optional, default: `10`, max: `100`)*: Items per page
  - `sortBy` *(optional, default: `'createdAt'`)*: `createdAt` | `updatedAt` | `title` | `priority` | `status`
  - `sortOrder` *(optional, default: `'desc'`)*: `asc` | `desc`
- **Response** (`200 OK`):
  ```json
  {
    "items": [
      {
        "id": "cm7ticket0001",
        "title": "Payment gateway timeout on checkout",
        "description": "Users reporting 504 errors when processing transactions via Stripe webhook.",
        "priority": "HIGH",
        "status": "IN_PROGRESS",
        "createdById": "cm7admin00001",
        "assignedToId": "cm7agent00001",
        "dueDate": "2026-10-20T18:00:00.000Z",
        "resolvedAt": null,
        "createdAt": "2026-10-16T13:00:00.000Z",
        "updatedAt": "2026-10-16T13:15:00.000Z",
        "createdBy": {
          "id": "cm7admin00001",
          "name": "System Administrator",
          "email": "admin@gmail.com",
          "role": "ADMIN"
        },
        "assignedTo": {
          "id": "cm7agent00001",
          "name": "Alex Agent",
          "email": "agent@gmail.com",
          "role": "SUPPORT_AGENT"
        }
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
  ```

#### 3. Get Ticket by ID
- **Method**: `GET`
- **Path**: `/api/tickets/:id`
- **Access**: Authenticated (Access checked against creator/assignee)
- **Response** (`200 OK`): Returns single `TicketResponseDto` object.

#### 4. Update Ticket
- **Method**: `PATCH`
- **Path**: `/api/tickets/:id`
- **Access**: Authenticated
  - **Admin**: Can update `title`, `description`, `status`, `priority`, `dueDate`, `assignedToId`.
  - **Agent**: Can **only** update `status`. Cannot edit tickets marked as `CLOSED`.
- **Request Body (Admin Example)**:
  ```json
  {
    "status": "RESOLVED",
    "priority": "MEDIUM",
    "assignedToId": "cm7agent00002"
  }
  ```
- **Request Body (Agent Example)**:
  ```json
  {
    "status": "IN_PROGRESS"
  }
  ```
- **Response** (`200 OK`): Returns updated `TicketResponseDto`.

#### 5. Delete Ticket
- **Method**: `DELETE`
- **Path**: `/api/tickets/:id`
- **Access**: `ADMIN` only (creator of ticket)
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Ticket \"Payment gateway timeout on checkout\" deleted successfully"
  }
  ```

---

### Comments Endpoints (`/api/tickets/:ticketId/comments`)

#### 1. Add Comment
- **Method**: `POST`
- **Path**: `/api/tickets/:ticketId/comments`
- **Access**: `ADMIN`, `SUPPORT_AGENT` (Must have access to the ticket)
- **Request Body**:
  ```json
  {
    "content": "Investigating logs in the payments service. Will update shortly."
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "id": "cm7comment0001",
    "content": "Investigating logs in the payments service. Will update shortly.",
    "ticketId": "cm7ticket0001",
    "authorId": "cm7agent00001",
    "createdAt": "2026-10-16T13:30:00.000Z",
    "updatedAt": "2026-10-16T13:30:00.000Z",
    "author": {
      "id": "cm7agent00001",
      "name": "Alex Agent",
      "email": "agent@gmail.com",
      "role": "SUPPORT_AGENT"
    }
  }
  ```

#### 2. Get Comments for Ticket
- **Method**: `GET`
- **Path**: `/api/tickets/:ticketId/comments`
- **Access**: `ADMIN`, `SUPPORT_AGENT`
- **Response** (`200 OK`): Array of comments ordered by `createdAt ASC`.

#### 3. Edit Comment
- **Method**: `PATCH`
- **Path**: `/api/tickets/:ticketId/comments/:commentId`
- **Access**: Comment Author only
- **Request Body**:
  ```json
  {
    "content": "Root cause identified: IP rate limiting on third-party provider."
  }
  ```
- **Response** (`200 OK`): Returns updated comment object.

#### 4. Delete Comment
- **Method**: `DELETE`
- **Path**: `/api/tickets/:ticketId/comments/:commentId`
- **Access**: Comment Author only
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Comment deleted successfully",
    "commentId": "cm7comment0001"
  }
  ```

---

### Dashboard & Analytics Endpoints (`/api/dashboard`)

#### 1. Get High-Level Dashboard Statistics
- **Method**: `GET`
- **Path**: `/api/dashboard/stats`
- **Access**: `ADMIN`, `SUPPORT_AGENT` (Filtered automatically to user's scope)
- **Response** (`200 OK`):
  ```json
  {
    "total": 42,
    "open": 12,
    "inProgress": 18,
    "resolved": 8,
    "closed": 4,
    "low": 6,
    "medium": 20,
    "high": 11,
    "urgent": 5,
    "unassigned": 3
  }
  ```

#### 2. Get Comprehensive Analytics & Visual Breakdown
- **Method**: `GET`
- **Path**: `/api/dashboard/analytics` (alias: `/api/dashboard/summary`)
- **Access**: `ADMIN`, `SUPPORT_AGENT`
- **Query Parameters**:
  - `timeRange` *(optional)*: `7d` | `30d` | `90d` | `all`
  - `startDate` *(optional)*: ISO Date string
  - `endDate` *(optional)*: ISO Date string
  - `groupBy` *(optional)*: `day` | `week`
  - `agentId` *(optional, Admin only)*: Filter analytics by specific agent
- **Response** (`200 OK`):
  ```json
  {
    "summary": {
      "total": 42,
      "open": 12,
      "inProgress": 18,
      "resolved": 8,
      "closed": 4,
      "totalResolved": 12,
      "totalUnresolved": 30,
      "resolutionRate": 28.57,
      "averageResolutionTimeHours": 5.4,
      "averageResolutionTimeFormatted": "5h 24m",
      "overdueCount": 2,
      "low": 6,
      "medium": 20,
      "high": 11,
      "urgent": 5,
      "unassigned": 3
    },
    "ticketsOverTime": [
      {
        "date": "2026-10-10",
        "label": "Oct 10",
        "created": 5,
        "resolved": 3
      }
    ],
    "priorityDistribution": [
      { "priority": "LOW", "label": "Low", "count": 6, "percentage": 14.3, "color": "#10b981" },
      { "priority": "MEDIUM", "label": "Medium", "count": 20, "percentage": 47.6, "color": "#3b82f6" },
      { "priority": "HIGH", "label": "High", "count": 11, "percentage": 26.2, "color": "#f59e0b" },
      { "priority": "URGENT", "label": "Urgent", "count": 5, "percentage": 11.9, "color": "#ef4444" }
    ],
    "statusDistribution": [
      { "status": "OPEN", "label": "Open", "count": 12, "percentage": 28.6, "color": "#f59e0b" },
      { "status": "IN_PROGRESS", "label": "In Progress", "count": 18, "percentage": 42.8, "color": "#3b82f6" },
      { "status": "RESOLVED", "label": "Resolved", "count": 8, "percentage": 19.0, "color": "#10b981" },
      { "status": "CLOSED", "label": "Closed", "count": 4, "percentage": 9.6, "color": "#64748b" }
    ],
    "resolvedVsUnresolved": [
      { "name": "Resolved", "count": 12, "percentage": 28.6, "color": "#10b981" },
      { "name": "Unresolved", "count": 30, "percentage": 71.4, "color": "#f59e0b" }
    ],
    "agentWorkload": [
      {
        "agentId": "cm7agent00001",
        "agentName": "Alex Agent",
        "agentEmail": "agent@gmail.com",
        "totalAssigned": 15,
        "openCount": 3,
        "inProgressCount": 7,
        "resolvedCount": 4,
        "closedCount": 1,
        "overdueCount": 1,
        "avgResolutionHours": 4.2
      }
    ],
    "slaMetrics": {
      "slaCompliantCount": 11,
      "slaBreachedCount": 1,
      "complianceRate": 91.67
    },
    "dateRange": {
      "startDate": "2026-10-09T00:00:00.000Z",
      "endDate": "2026-10-16T23:59:59.999Z",
      "timeRange": "7d",
      "groupBy": "day"
    }
  }
  ```

---

### System Root Endpoint (`/api`)

- **Method**: `GET`
- **Path**: `/api`
- **Access**: Public
- **Response** (`200 OK`):
  ```text
  Hello World!
  ```

---

## Real-Time WebSocket Protocol (Socket.IO)

The platform features real-time synchronization between support agents and administrators via NestJS WebSockets and Socket.IO.

### Gateway & Connection Setup

- **Namespace**: `/comments`
- **Connection URL**: `ws://localhost:3000/comments` (or `http://localhost:3000/comments` with HTTP Long-Polling fallback)
- **Authentication**: JWT token passed via handshake:
  ```typescript
  import { io } from 'socket.io-client';

  const socket = io('http://localhost:3000/comments', {
    auth: {
      token: '<your_jwt_access_token>',
    },
    transports: ['websocket', 'polling'],
  });
  ```
  *(The gateway also accepts standard `Authorization: Bearer <token>` in handshake headers).*

---

### Client-to-Server Events

#### 1. `join_ticket`
Subscribes the socket connection to a specific ticket room (`ticket:<ticketId>`). Permissions are validated against the database.
- **Payload**:
  ```json
  { "ticketId": "cm7ticket0001" }
  ```
- **Server Ack / Response**: Emits `joined_ticket` on success or `error` if unauthorized.

#### 2. `leave_ticket`
Unsubscribes the socket from the ticket room.
- **Payload**:
  ```json
  { "ticketId": "cm7ticket0001" }
  ```

#### 3. `typing`
Broadcasts live typing status to other peers in the room.
- **Payload**:
  ```json
  {
    "ticketId": "cm7ticket0001",
    "isTyping": true
  }
  ```

#### 4. `send_comment`
Submits a new comment directly through WebSocket.
- **Payload**:
  ```json
  {
    "ticketId": "cm7ticket0001",
    "content": "Looking into the database query logs."
  }
  ```

#### 5. `edit_comment`
Updates an existing comment authored by the user.
- **Payload**:
  ```json
  {
    "ticketId": "cm7ticket0001",
    "commentId": "cm7comment0001",
    "content": "Updated comment body."
  }
  ```

#### 6. `delete_comment`
Deletes a comment authored by the user.
- **Payload**:
  ```json
  {
    "ticketId": "cm7ticket0001",
    "commentId": "cm7comment0001"
  }
  ```

---

### Server-to-Client Broadcasts

All events are broadcast to room `ticket:<ticketId>`:

| Event Name | Payload Description | Payload Example |
| :--- | :--- | :--- |
| `joined_ticket` | Confirms client successfully joined room | `{"ticketId": "cm7ticket0001", "success": true}` |
| `left_ticket` | Confirms client left room | `{"ticketId": "cm7ticket0001", "success": true}` |
| `new_comment` | Broadcast whenever a new comment is posted | `{"id": "c1", "content": "Hello", "author": {...}, ...}` |
| `comment_updated` | Broadcast whenever an author modifies a comment | `{"id": "c1", "content": "Updated content", ...}` |
| `comment_deleted` | Broadcast when a comment is removed | `{"ticketId": "cm7ticket0001", "commentId": "c1"}` |
| `user_typing` | Broadcast to all peers except the sender | `{"ticketId": "cm7ticket0001", "user": {"id": "u1", "name": "Alex", "role": "SUPPORT_AGENT"}, "isTyping": true}` |
| `error` | Sent on permission failure or invalid input | `{"message": "Access denied: You do not have permission"}` |

---

## Dashboard Analytics & Data Visualization

The analytics engine transforms raw ticket and SLA data into actionable insights rendered via **Recharts**:

1. **Executive Stat Cards (`DashboardStats.tsx`)**:
   - Total Tickets, Open, In Progress, Resolved, and Closed counts.
   - Quick navigation triggers that filter the tickets table upon clicking.

2. **Tickets Over Time Trend (`TicketsTrendChart.tsx`)**:
   - Built with Recharts `ResponsiveContainer`, `AreaChart`, and `Area`.
   - Compares incoming tickets (`created`) against resolved volume (`resolved`) with gradient fills and interactive custom tooltip.

3. **Priority Distribution (`PriorityDistributionChart.tsx`)**:
   - Built with Recharts `PieChart`, `Pie`, and `Cell`.
   - Color mapping: Low (`#10b981`), Medium (`#3b82f6`), High (`#f59e0b`), Urgent (`#ef4444`).

4. **Resolved vs Unresolved Status (`ResolvedVsUnresolvedChart.tsx`)**:
   - Built with Recharts `BarChart` with SLA metric callouts (SLA compliance percentage, compliant count, breached count).

5. **Agent Workload Matrix (`AgentWorkloadChart.tsx`)**:
   - Multi-bar chart displaying workload distributions (Open, In Progress, Resolved, Overdue) across support agents.
   - Enables managers to balance active caseloads across team members.

---

## Testing & Quality Assurance

### Backend Unit & Integration Tests

The backend test suite is configured with **Jest** and mocks Prisma database interactions.

```bash
cd backend

# Run all unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate code coverage report
npm run test:cov

# Run end-to-end (e2e) tests
npm run test:e2e
```

**Test Coverage Highlights**:
- `tickets.service.spec.ts`: Validates Admin-only ticket creation, Agent status-only updates, forbidden updates on closed tickets, scoped query isolation, and cascading deletes.
- `comments.service.spec.ts`: Validates ticket room access permission checks, author-only edit/delete enforcement, and WebSocket broadcast invocation.
- `dashboard.service.spec.ts`: Validates aggregation queries, status breakdown, SLA breach calculations, and date range filters.

### Backend Linting & Formatting

```bash
cd backend

# Fast type-aware linting using Oxlint
npm run lint

# Code formatting with Prettier
npm run format
```

### Frontend Typechecking

```bash
cd frontend

# Verify TypeScript types without emitting bundle
npm run typecheck
```

---

## Troubleshooting & FAQs

### 1. Database Connection Refused
**Symptom**: `PrismaClientInitializationError: Can't reach database server at localhost:5432`
- **Solution**: Check that the PostgreSQL service is running:
  - Windows: Open Services (`services.msc`) and verify `postgresql-x64-XX` is Running.
  - Linux/macOS: `sudo systemctl status postgresql` or `brew services list`.
- Verify the credentials in `backend/.env` match your local PostgreSQL configuration.

### 2. CORS Errors in Browser Console
**Symptom**: `Access to XMLHttpRequest at 'http://localhost:3000/api/...' from origin 'http://localhost:5173' has been blocked by CORS policy`
- **Solution**: Ensure `FRONTEND_URL` in `backend/.env` is set to `http://localhost:5173`. `backend/src/main.ts` automatically authorizes `http://localhost:5173` and `http://127.0.0.1:5173`.

### 3. Socket.IO Connection Rejected or Unauthorized
**Symptom**: `WebSocket connection to 'ws://localhost:3000/comments' failed` or `Connection rejected (invalid token)`
- **Solution**: The user must be authenticated. Verify that a valid token exists in browser localStorage under key `token` or `accessToken`. If the token is expired, log out and sign in again.

### 4. Support Agent Cannot Edit Ticket Description or Priority
**Symptom**: `403 Forbidden: Access denied: Support Agents are only permitted to update ticket status`
- **Explanation**: This is by design. Only users with the `ADMIN` role have permissions to modify ticket metadata (title, description, priority, assignee, due date). Support Agents are restricted to transitioning ticket status (`OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`).

### 5. Port Conflicts (`EADDRINUSE`)
**Symptom**: `Error: listen EADDRINUSE: address already in use :::3000` or `:::5173`
- **Solution**: Identify and terminate the occupying process, or adjust the `PORT` variable in the respective `.env` file:
  ```powershell
  # Windows PowerShell - find process occupying port 3000
  Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
  ```

---

## Security Best Practices

1. **Password Hashing**: Passwords are never stored in plaintext. They are salted and hashed using `bcrypt` with 10 salt rounds prior to persistence.
2. **Stateless JWT Authentication**: Authenticated sessions rely on signed JWT tokens with claims (`sub`, `email`, `role`).
3. **Global Validation Pipe**: `AppValidationPipe` automatically strips unwhitelisted properties (`whitelist: true`) and transforms payload types (`transform: true`), preventing mass assignment vulnerabilities.
4. **Role Guards**: Backend endpoints strictly check roles via `@Roles(Role.ADMIN, ...)` backed by NestJS `Reflector`. Frontend routes enforce permissions via `<ProtectedRoute allowedRoles={['ADMIN']}>`.
5. **Data Scoping & Tenant Isolation**: All queries explicitly bind `where.createdById = currentUser.id` (for Admins) or `where.assignedToId = currentUser.id` (for Agents), preventing unauthorized horizontal privilege escalation (IDOR).
6. **Error Sanitization**: `AllExceptionsFilter` catches uncaught exceptions, logs details server-side, and returns uniform sanitized error structures (`{ statusCode, timestamp, path, message }`) without exposing database stack traces.
