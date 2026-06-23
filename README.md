# 📚 Library Management System

A modern, full-stack Library Management System built with **Node.js, Express.js, TypeScript, PostgreSQL, Sequelize, React, Vite, Tailwind CSS, Zustand, React Query, and Azure AI Integration**.

Designed for educational institutions, public libraries, and digital library management workflows, this platform provides complete book lifecycle management, membership administration, borrowing workflows, fine tracking, AI-powered book scanning, and role-based access control.

---

# 🚀 Live Demo

### Frontend Application

**Deploy Link:** Coming Soon

### Backend API

**Deploy Link:** Coming Soon

### API Documentation

**Swagger Documentation:** Coming Soon

---

# 📖 Overview

The Library Management System automates library operations including:

* User Authentication & Authorization
* Role-Based Access Control (RBAC)
* Member Management
* Membership Plan Management
* Book Catalog Management
* Book Borrow & Return Operations
* Fine Calculation & Tracking
* Dashboard Analytics
* AI-Powered Book Cover Scanner
* API Documentation
* CI/CD Automation

---

# ✨ Key Features

## 🔐 Authentication & Authorization

* JWT Authentication
* Secure Login System
* Refresh Token Support
* Password Encryption using Bcrypt
* Role-Based Access Control
* Protected API Routes

### Supported Roles

* Admin
* Member

---

## 👨‍💼 Admin Management

Administrators can:

* Manage Users
* Manage Members
* Manage Books
* Manage Categories
* Manage Membership Plans
* Track Fines
* Monitor Borrowing Activity
* Access Dashboard Analytics

---

## 👥 Member Management

Features include:

* Member Registration
* Membership Assignment
* Membership Renewal
* Membership Status Tracking
* Borrowing Eligibility Validation

---

## 📚 Book Management

* Add Books
* Update Books
* Delete Books
* Search Books
* Category Assignment
* Availability Tracking
* Inventory Management

---

## 🏷️ Category Management

* Create Categories
* Update Categories
* Delete Categories
* Organize Library Inventory

---

## 🔄 Borrow & Return Workflow

* Issue Books
* Return Books
* Due Date Management
* Borrow History Tracking
* Availability Validation

---

## 💰 Fine Management

* Fine Calculation
* Fine Tracking
* Payment Status Monitoring
* Fine History Reports

---

## 📋 Membership Plans

* Create Plans
* Update Plans
* Delete Plans
* Duration Management
* Borrowing Limits
* Pricing Configuration

---

## 🤖 AI Book Scanner

AI-powered book cover analysis using:

### Azure Vision OCR

Extracts text from book covers.

### Azure Translator

Converts extracted text into English.

### Google Gemini AI

Analyzes OCR content and identifies:

* Book Title
* Author Name

This dramatically reduces manual book entry operations.

---

## 📊 Dashboard Analytics

Provides:

* Total Books
* Active Members
* Borrow Statistics
* Fine Reports
* Membership Statistics
* Library Overview

---

# 🏗️ System Architecture

## Frontend

```text
React 19
│
├── TypeScript
├── Vite
├── Tailwind CSS
├── React Router
├── React Query
├── Zustand
├── Axios
├── React Hook Form
├── Zod
├── Sonner
└── Framer Motion
```

## Backend

```text
Node.js
│
├── Express.js
├── TypeScript
├── Sequelize ORM
├── PostgreSQL
├── JWT Authentication
├── Bcrypt
├── Zod Validation
├── Swagger
├── Winston Logger
├── Multer
├── Azure AI
├── Gemini AI
└── Jest Testing
```

---

# 🗂 Backend Project Structure

```text
src
│
├── config
├── controllers
├── middlewares
├── routes
├── database
│   ├── models
│   ├── migrations
│   └── seeders
│
├── modules
│   ├── admin
│   ├── auth
│   ├── azureAI
│   ├── books
│   ├── categories
│   ├── dashboard
│   ├── fines
│   ├── issues
│   ├── members
│   └── plans
│
├── utils
├── validators
└── server.ts
```

---

# 🛠 Tech Stack

## Frontend

* React 19
* TypeScript
* Vite
* Tailwind CSS
* React Router DOM
* React Query
* Zustand
* Axios
* React Hook Form
* Zod
* Sonner
* Framer Motion

## Backend

* Node.js
* Express.js
* TypeScript
* PostgreSQL
* Sequelize ORM
* JWT
* Bcrypt
* Zod
* Multer
* Swagger
* Winston

## AI Services

* Azure Vision OCR
* Azure Translator
* Google Gemini AI

## Testing

* Jest
* Supertest

## CI/CD

* GitHub Actions

---

# 🧪 Testing

### Unit Tests

```text
133+ Unit Tests
```

Coverage includes:

* Admin Service
* Auth Service
* Member Service
* Membership Plan Service
* Azure AI Scanner Service
* Validation Layer
* Repository Mocking

### Integration Tests

```text
102+ Integration Tests
```

Coverage includes:

* Authentication APIs
* Admin APIs
* Members APIs
* Books APIs
* Categories APIs
* Fine APIs
* Membership APIs
* Dashboard APIs

---

# 🔄 CI/CD Pipeline

GitHub Actions automatically performs:

```text
✓ Install Dependencies
✓ TypeScript Build Validation
✓ Unit Tests Execution
✓ Integration Tests Execution
✓ Pull Request Validation
```

---

# ⚙️ Environment Variables

Create a `.env` file inside the server directory.

```env
NODE_ENV=development

PORT=5000

DATABASE_URL=postgresql://username:password@localhost:5432/library_db

JWT_SECRET=your_jwt_secret

AZURE_AI_KEY=your_azure_key
AZURE_AI_ENDPOINT=your_azure_endpoint
AZURE_AI_REGION=centralindia

GEMINI_API_KEY=your_gemini_api_key
```

---

# 🚀 Local Development Setup

## Clone Repository

```bash
git clone https://github.com/your-username/library-management-system.git

cd library-management-system
```

---

## Backend Setup

```bash
cd server

npm install

npm run dev
```

Backend runs on:

```text
http://localhost:5000
```

---

## Frontend Setup

```bash
cd client

npm install

npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

# 📚 API Documentation

Swagger documentation will be available at:

```text
Deploy Link Coming Soon
```

Local:

```text
http://localhost:5000/api-docs
```

---

# 🔒 Security Features

* JWT Authentication
* Password Hashing (Bcrypt)
* Role-Based Authorization
* Zod Request Validation
* Rate Limiting
* Helmet Security Headers
* CORS Protection
* Environment Variable Validation

---

# 🎯 Future Enhancements

* Email Notifications
* Mobile Application
* Reservation System
* Barcode Scanner Support
* QR Code Integration
* Advanced Analytics
* Multi-Library Support
* Cloud Storage Integration
* Payment Gateway Integration

---

# 👨‍💻 Author

**Yogeshwaran S**

GitHub: https://github.com/YogeshwaranOfficial

LinkedIn: Add Your LinkedIn Profile

Portfolio: Coming Soon

---

# 📄 License

This project is licensed under the MIT License.

---

## ⭐ Support

If you found this project useful, consider giving it a star on GitHub.

```text
⭐ Star the Repository
🍴 Fork the Project
🐛 Report Issues
🚀 Contribute
```
