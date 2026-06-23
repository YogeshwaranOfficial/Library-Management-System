# 📚 Library Management System

A enterprise-grade, modern, full-stack Library Management System built with **Node.js, Express.js, TypeScript, PostgreSQL, Sequelize ORM, React 19, Vite, Tailwind CSS, Zustand, React Query, and Multi-LLM Cloud AI Integration (Azure & Gemini)**.

Designed for educational institutions, public libraries, and digital library management workflows, this platform provides complete book lifecycle management, membership administration, automated borrowing workflows, granular fine tracking, AI-powered book scanner engines, and deep role-based access control (RBAC).

---

# 🚀 Live Deployments & Portals

### 💻 Production Frontend Application
* **Deploy URL:** [https://library-management-system-by-yogeshwaran.vercel.app](https://library-management-system-by-yogeshwaran.vercel.app)
* **Hosting Platform:** Vercel

### ⚙️ Production Backend API Service
* **API Base URL:** [https://library-management-system-g9dg.onrender.com](https://library-management-system-g9dg.onrender.com)
* **Hosting Platform:** Render (Linux Node.js Container Environment)

### 📄 Live Interactive API Documentation
* **Swagger Portal:** [https://library-management-system-g9dg.onrender.com/api-docs](https://library-management-system-g9dg.onrender.com/api-docs)

---

# 🔑 QA & Verification Testing Credentials

The live system enforces strict **Role-Based Access Control (RBAC)**. Use the authorized credentials below to verify corresponding dashboards, permissions, and entity data tables:

| Portal Access Level | Authorized Email Address | Protected Password | System Permissions & Access Scope |
| :--- | :--- | :--- | :--- |
| 🛡️ **System Administrator** | `admin@library.com` | `Password@123` | Complete read/write/delete permissions across members, books, global configurations, plans, and metrics. |
| 📚 **Librarian / Staff** | `lib@gmail.com` | `Password@123` | Operational access to issue/return tracking, books catalog search, fine accruals, and manual checkouts. |

---

# 🏗️ Enterprise System Architecture

The application implements a decoupled client-server architecture built around a **Modular Monolith** pattern on the backend, ensuring a separation of concerns across logic, access controls, data persistence, and remote cloud cognitive processors.

![System Architecture Overview](Architecture%20Diagram.png)

### 🖥️ Client Application Tier (Frontend)
* **Core Engine:** React 19 + Vite (Fast Refresh Development Compilation Engine)
* **Language Layer:** TypeScript (Strict Compilation Matrix)
* **State Management Layout:** * **Zustand:** Synchronous client state, persistent sessions, token lifecycles, and UI settings.
  * **React Query (TanStack):** Asynchronous network cache, optimistic queries, invalidation loops, and retry management.
* **Network & Validation:** Axios HTTP Engine + Zod Request Validation Data Mappings.
* **UI Components & Motion:** Tailwind CSS + Framer Motion (Fluid Layout Interpolations) + Sonner (Real-time Contextual Toasts).

### ⚙️ Server Application Tier (Backend Engine)
* **Runtime Platform:** Node.js Environment (ES Modules / ESM Layout - `"type": "module"`)
* **Framework:** Express.js utilizing strict middleware pipelines.
* **Database Driver / Data Layer:** Sequelize ORM mapping strict schemas natively to PostgreSQL instances.
* **Middlewares Engine Stack:**
  * **CORS Middleware:** Strict Origin Parsing (Enforced prior to body processing to permit Vercel Handshakes).
  * **Helmet / Rate Limiting:** HTTP Header Hardening + Pre-emptive DDOS Request Throttling.
  * **Zod Layer:** Server-side request schema interception before hitting controller scopes.
  * **Winston Logs:** Log rotations logging production events and failures to disk and container outputs.

### 💾 Persistence & Storage Tier (Database)
* **Engine:** PostgreSQL hosted Serverless via Neon DB Architecture.
* **Live Connection Topology:** Enforced SSL Handshake Engine Pooling (`sslmode=require`).
* **Connection Pooling Endpoint:** `postgresql://neondb_owner:***@ep-late-silence-ao6ovftj-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`

---

# ✨ Key Functional Modules

## 🔐 Authentication, Session & Access Safety
* **JSON Web Tokens (JWT):** Short-lived identity access keys paired with safe HTTP-Only cookie strategies.
* **Password Hashing:** High-entropy encryption powered by `bcrypt`.
* **Route Isolation:** Express router-level middleware blocks unauthorized cross-role traversal.

## 🤖 Multi-Cloud AI Book Scanner Pipeline
The system automates asset registration using a sequential multi-cloud AI ingestion chain:
1. **Azure Cognitive Vision (OCR):** Extracts text from raw image captures of physical book covers uploaded via `Multer`.
2. **Azure AI Translator:** Normalizes, parses, and translates foreign language cover elements cleanly into English string sets.
3. **Google Gemini AI Engine:** Processes the structured text array, executing semantic parsing to extract the exact **Book Title** and **Author Name**, completely eliminating manual typewriter operations for library inventory registry.

## 🔄 Automated Core Borrow & Fine Workflows
* **Lifecycle State Machine:** Handles `Available` ➔ `Issued` ➔ `Overdue` ➔ `Returned` transitions.
* **Cron Sync Engine:** Background jobs running node-cron check the Neon DB cluster nightly to automatically calculate and append overdue financial fine metrics to defaulting member accounts.

---

# 🗂 Backend Modular Directory Breakdown

```text
server/src/
├── config/                  # Server Portals, Helmet Settings, CORS Origin Matrices, Rate Limiters
├── controllers/             # Express Layer Request Interceptors & JSON Response Generators
├── database/                # Sequelize Model Declarations, Static Seeders, Migration Sequences
│   ├── associations/        # Primary-Foreign Key Structural Relationship Mapping Definitions
│   ├── migrations/          # Version-Controlled Database Schema Scripts
│   └── models/              # Sequelize Class Table Schema Implementations
├── docs/                    # OpenAPI / Swagger Specification Architectures
├── middlewares/             # Global JWT Hooks, RBAC Policies, Error Boundaries, Cors Interceptors
├── modules/                 # Cohesive Domain Entities (Isolating Controller, Service, and Route Specs)
│   ├── admin/               # Administrative Control Matrices
│   ├── auth/                # Authenticated Session Lifecycles & Sign-in Handlers
│   ├── azureAI/             # Azure Vision OCR & Gemini AI Processor Chains
│   ├── books/               # Catalog, Inventory, and Asset Filtering Controls
│   ├── categories/          # Structural Metadata & Genre Mapping Definitions
│   ├── dashboard/           # Computational Aggregations & Analytical Telemetry Generators
│   ├── fines/               # Financial Accrual Processors & Payment Monitors
│   ├── issues/              # Physical Checkout & Return Ledger Transactions
│   ├── members/             # Subscription Matrices & Consumer Metadata
│   ├── plans/               # Tiered Library Access Pricing, Caps, & Durations
│   └── reports/             # PDF Manifest Generators (via jsPDF Modules)
├── routes/                  # Core Endpoint Registry (/api/v1 Global Mount Base Router)
├── utils/                   # Shared Injections (Winston Log Logger Engines, Formatters)
├── validators/              # Common Reusable Domain Input Validation Schemes
└── server.ts                # Application Cluster Bootstrap Entrypoint

```

---

# 🧪 Quality Assurance & Test Coverage Matrices

The repository enforces software engineering practices with a deep unit and integration testing suite utilizing **Jest** and **Supertest**:

* **🧪 133+ System Unit Tests:** Validates mock service layers, mock relational models, isolated business logic patterns, error thresholds, and Azure/Gemini AI API edge cases without querying production clusters.
* **🧪 102+ API Integration Tests:** Spawns live sandbox routing lifecycles to trace network headers, verify Zod schema rejections, test database writes, and evaluate RBAC multi-role access controls across `/api/v1/*` endpoints.

---

# 🔄 CI/CD Automation Workflow

Every code mutation pushed to GitHub undergoes rigorous validation via a centralized **GitHub Actions Pipeline**:

```text
[ Git Push / PR ] ➔ 📦 Install Packages ➔ ⚙️ Type-Check Validation (tsc) ➔ 🧪 Run Unit Suite ➔ 🧪 Run Integration Suite ➔ 🎉 Deploy Approval

```

This ensures no build-breaking code mutations or type mismatches are ever merged into `develop` or `main`.

---

# ⚙️ Production Environment Variables Reference

To initialize local nodes or modify cloud environment targets, construct an active `.env` file mapping these parameters:

```env
# Runtime Environment Setup
NODE_ENV=production
PORT=5000

# PostgreSQL Neon Serverless Connection Matrix
DATABASE_URL=postgresql://neondb_owner:npg_ZtgV3bqocW0H@ep-late-silence-ao6ovftj-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require

# Encryption Cryptographical Primitives
JWT_SECRET=your_jwt_secret_hasher_key

# Azure AI Cognitive Cloud Configurations
AZURE_AI_KEY=your_azure_ai_cognitive_services_key
AZURE_AI_ENDPOINT=[https://your-endpoint.cognitiveservices.azure.com/](https://your-endpoint.cognitiveservices.azure.com/)
AZURE_AI_REGION=centralindia

# Google Gemini Large Language Model Key
GEMINI_API_KEY=your_google_gemini_api_key_string

```

---

# 🚀 Local Development Quickstart

Ensure you have **Node.js v24+** and **PostgreSQL** or a Neon DB sandbox link configured before launching.

### 1. Repository Core Ingestion

```bash
git clone [https://github.com/YogeshwaranOfficial/Library-Management-System.git](https://github.com/YogeshwaranOfficial/Library-Management-System.git)
cd Library-Management-System

```

### 2. Backend Server Assembly

```bash
cd server
npm install
# Execute development watcher using tsx compilation layers
npm run dev

```

* API Entrypoint: `http://localhost:5000`
* Local API Docs: `http://localhost:5000/api-docs`

### 3. Frontend Client Assembly

```bash
cd ../client
npm install
npm run dev

```

* Dev Server Entrypoint: `http://localhost:5173`

---

# 👨‍💻 Developer & Maintenance Profile

**Yogeshwaran S**

* **GitHub Repository:** [https://github.com/YogeshwaranOfficial](https://github.com/YogeshwaranOfficial)
* **Project Tracking Link:** [Library Management System Git Repo](https://github.com/YogeshwaranOfficial/Library-Management-System)

---

# 📄 License

This architecture framework and its source distribution matrices are open-source software licensed standardly under the terms of the **MIT License**.

