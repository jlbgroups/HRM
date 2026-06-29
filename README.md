<h1 align="center">
  <img src="https://img.shields.io/badge/HRM-Portal-6c63ff?style=for-the-badge&logo=react&logoColor=white" alt="HRM Portal" />
</h1>

<h3 align="center">🏢 Human Resource Management Portal</h3>
<h4 align="center">A full-stack, multi-tenant SaaS HRM system built with the MERN stack</h4>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb" />
  <img src="https://img.shields.io/badge/Vite-Build-646CFF?style=flat-square&logo=vite" />
  <img src="https://img.shields.io/badge/JWT-Auth-000000?style=flat-square&logo=jsonwebtokens" />
  <img src="https://img.shields.io/badge/Deployed-Render-46E3B7?style=flat-square&logo=render" />
</p>

<p align="center">
  <a href="https://hrm.levroxen.com" target="_blank">
    <img src="https://img.shields.io/badge/🌐 Live Demo-hrm.levroxen.com-6c63ff?style=for-the-badge" />
  </a>
</p>

---

## 👩‍💻 About the Developer

> **Designed, developed, and deployed by Vanshika Rathore**
>
> This entire project — from system architecture to UI design, backend APIs, database modelling, and cloud deployment — was built solo as a production-grade SaaS HR Management solution.

---

## 📌 Project Overview

The **HRM Portal** is a comprehensive, cloud-deployed Human Resource Management System designed to help organizations manage their entire HR lifecycle from a single, unified dashboard.

Built as a **multi-tenant SaaS platform**, it supports **Super Admins**, **Admins (Organizations)**, and **Employees** — each with their own role-specific dashboards, permissions, and data isolation.

---

## ✨ Key Features

### 🔐 Authentication & Role Management
- JWT-based secure authentication with bcrypt password hashing
- Three role levels: **Super Admin → Admin (Company) → Employee**
- Protected routes with middleware-level authorization

### 🏠 Dashboard
- Real-time HR statistics and analytics overview
- Role-specific dashboard views
- Attendance summary, leave status, pending approvals

### 👥 Employee Management
- Complete employee lifecycle: onboarding to exit
- Employee profile with document uploads (Multer)
- Designation and Department-wise organization

### ⏰ Attendance System
- Daily attendance tracking
- Attendance history and monthly reports
- Admin approval workflow

### 🌴 Leave Management
- Leave request & approval system
- Leave balance tracking
- Email notifications on approval/rejection

### 💰 Payroll & Salary
- Automated payroll processing
- Salary advance (pre-payment) requests
- Increment management with history
- PDF payslip generation (Puppeteer + Chromium)

### 📋 Task Management
- Task assignment to employees
- Status tracking: Pending → In Progress → Completed
- Priority and deadline management

### ⚠️ Warning & Complaint System
- Admin can issue formal warnings to employees
- Employees can raise complaints
- Full audit trail of HR actions

### 📝 Resignation Management
- Employee resignation request workflow
- Admin review and approval process
- Automated email communication

### 🏖️ Holiday Management
- Company-wide holiday calendar
- Admin can add/manage holidays

### 📢 Notifications System
- Real-time in-app notifications
- Email alerts via Nodemailer

### 🎫 Support Ticket System
- Employee support ticket creation
- Attachment support
- Message-based resolution thread

### 📜 Policies & Letters
- Company policy document management
- Appreciation letters & formal HR letters
- PDF generation support

### 💳 SaaS Subscription & Plans
- Multi-tenant plan management (Trial / Paid)
- Transaction history and billing
- Super Admin controls all organizations

### ⚙️ Website Settings
- Admin-configurable branding
- Logo, company name, contact info

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI Framework |
| **React Router v7** | Client-side routing |
| **Vite** | Build tool & dev server |
| **Bootstrap 5** | UI components |
| **Tailwind CSS 4** | Utility styling |
| **Lucide React** | Icon library |
| **Axios** | HTTP client |
| **React Helmet Async** | SEO & meta tags |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js + Express 5** | REST API server |
| **MongoDB + Mongoose** | Database & ODM |
| **JWT** | Authentication tokens |
| **bcryptjs** | Password hashing |
| **Multer** | File & image uploads |
| **Nodemailer** | Email notifications |
| **Puppeteer Core** | PDF generation |
| **@sparticuz/chromium** | Headless browser for PDF |
| **dotenv** | Environment config |
| **CORS** | Cross-origin security |

---

## 🗂️ Project Structure

```
hrm_portal/
├── backend/                    # Node.js + Express REST API
│   ├── config/                 # DB connection config
│   ├── modules/                # Feature-based modules
│   │   ├── auth/               # Login, Register, JWT
│   │   ├── employees/          # Employee CRUD
│   │   ├── attendance/         # Attendance tracking
│   │   ├── leaves/             # Leave management
│   │   ├── payroll/            # Salary & payroll
│   │   ├── Employeepayroll/    # Employee-side payroll
│   │   ├── task/               # Task assignments
│   │   ├── warning/            # HR warnings
│   │   ├── complaint/          # Complaints
│   │   ├── resignation/        # Resignation workflow
│   │   ├── departments/        # Department management
│   │   ├── holidays/           # Holiday calendar
│   │   ├── notifications/      # In-app notifications
│   │   ├── policies/           # Company policies
│   │   ├── support/            # Support tickets
│   │   ├── saas/               # SaaS plans & trials
│   │   ├── transactions/       # Billing & payments
│   │   ├── increment/          # Salary increments
│   │   ├── prepayment/         # Salary advance
│   │   ├── contact/            # Contact forms
│   │   └── websiteSettings/    # Branding settings
│   ├── routes/                 # Shared routes
│   ├── middleware/             # Auth & error middleware
│   ├── models/                 # Mongoose schemas
│   ├── utils/                  # Helpers (email, etc.)
│   ├── uploads/                # Static file storage
│   └── server.js               # Express app entry point
│
└── hrm-frontend/               # React + Vite Frontend
    ├── src/
    │   ├── admin/              # Admin dashboard pages
    │   ├── employee/           # Employee portal pages
    │   ├── superadmin/         # Super admin controls
    │   ├── auth/               # Login / Register pages
    │   ├── layouts/            # Layout wrappers
    │   ├── context/            # React Context (global state)
    │   ├── api/                # Axios API calls
    │   ├── pages/              # Public-facing pages
    │   ├── common_moduls/      # Reusable components
    │   ├── hook/               # Custom React hooks
    │   └── App.jsx             # Main app with routing
    └── index.html
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- npm / yarn

### 1. Clone the Repository
```bash
git clone https://github.com/VanshikaRathore288/HRM.git
cd HRM
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in `/backend`:
```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
```

Start the backend:
```bash
npm start
```

### 3. Frontend Setup
```bash
cd hrm-frontend
npm install
```

Create a `.env` file in `/hrm-frontend`:
```env
VITE_API_URL=http://localhost:5001
```

Start the frontend:
```bash
npm run dev
```

---

## 🌐 Live Deployment

| Service | URL |
|---|---|
| **Frontend** | [https://hrm.levroxen.com](https://hrm.levroxen.com) |
| **Backend API** | [https://hrm-vyaq.onrender.com](https://hrm-vyaq.onrender.com) |

> Deployed on **Render** with custom domain via **Levroxen**

---

## 📡 API Overview

The backend follows a RESTful module-based architecture:

| Endpoint Prefix | Module |
|---|---|
| `/api/auth` | Authentication |
| `/api/employees` | Employee management |
| `/api/attendance` | Attendance |
| `/api/leaves` | Leave requests |
| `/api/payroll` | Payroll processing |
| `/api/tasks` | Task management |
| `/api/warnings` | HR warnings |
| `/api/complaints` | Complaints |
| `/api/resignations` | Resignations |
| `/api/departments` | Departments |
| `/api/designations` | Designations |
| `/api/holidays` | Holidays |
| `/api/notifications` | Notifications |
| `/api/policies` | Company policies |
| `/api/support` | Support tickets |
| `/api/saas` | SaaS management |
| `/api/plans` | Subscription plans |
| `/api/transactions` | Billing |
| `/api/increment` | Salary increments |
| `/api/salary-advance` | Pre-payments |
| `/api/letters` | HR letters |
| `/api/appreciations` | Appreciation letters |
| `/api/website-settings` | Branding config |
| `/api/admin` | Admin profile |
| `/api/super-admin` | Super admin profile |

---

## 🔒 Security Features

- ✅ JWT token-based authentication
- ✅ bcrypt password hashing (salted)
- ✅ Role-based access control (RBAC)
- ✅ CORS whitelist for trusted origins
- ✅ Environment variable isolation (dotenv)
- ✅ Input validation & error handling middleware

---

## 📄 License

This project is proprietary software built and maintained by **Vanshika Rathore**.  
All rights reserved © 2025 Vanshika Rathore.

---

<p align="center">
  Made with ❤️ by <strong>Vanshika Rathore</strong><br/>
  <a href="https://github.com/VanshikaRathore288">github.com/VanshikaRathore288</a>
</p>
