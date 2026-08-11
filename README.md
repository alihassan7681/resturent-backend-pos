# RestroPOS — Restaurant POS & Management System

A full-stack restaurant management system built with the **MERN Stack** (MongoDB, Express, React, Node.js) and **Tailwind CSS**.

## Features

- 🔐 **JWT Authentication** with Role-Based Access Control (Admin, Cashier, Kitchen)
- 🖥️ **POS Screen** — Touch-optimized with category filters, cart management, discount, and payment selection
- 👨‍🍳 **Kitchen Display System (KDS)** — Real-time order updates via Socket.io with elapsed timers
- 🧾 **Dual Receipt Printing** — Kitchen Order Ticket (KOT, no prices) + Customer Bill (itemized with tax/discount)
- 📊 **Admin Dashboard** — Revenue charts, top items, payment breakdown
- 🗂️ **Menu Management** — Add/edit items with veg/non-veg badges, availability toggle
- 💰 **Expense Tracker** — Record and categorize business expenses
- 🪑 **Table Management** — Visual floor plan with live occupancy status
- 👥 **User Management** — Add/edit staff with role assignment
- ⚙️ **Settings** — Restaurant info, GST number, tax rate, receipt footer

## Tech Stack

| Layer       | Technology |
|-------------|------------|
| Frontend    | React 18, Vite, Tailwind CSS, Recharts, Socket.io-client |
| Backend     | Node.js, Express, Socket.io |
| Database    | MongoDB (Atlas or local), Mongoose |
| Auth        | JWT (jsonwebtoken, bcryptjs) |
| HTTP Client | Axios |
| Routing     | React Router v6 |

## Quick Start

### 1. Install Dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure Environment

Edit `backend/.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/restropos   # or MongoDB Atlas URI
JWT_SECRET=your_secure_secret_here
```

### 3. Seed Demo Data

```bash
cd backend && npm run seed
```

This creates:
- 3 demo users (admin, cashier, kitchen staff)
- 5 menu categories with 16 food items
- 8 restaurant tables
- Sample orders and expenses

### 4. Start the Application

**Terminal 1 — Backend:**
```bash
cd backend && npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend && npm run dev
```

Open: [http://localhost:3000](http://localhost:3000)

## Demo Credentials

| Role    | Email              | Password     | Access |
|---------|--------------------|--------------|--------|
| Admin   | admin@restro.com   | password123  | Full   |
| Cashier | cashier@restro.com | password123  | POS    |
| Kitchen | kitchen@restro.com | password123  | KDS    |

## Project Structure

```
sangat cafa/
├── backend/
│   ├── config/         # MongoDB connection
│   ├── controllers/    # Business logic
│   ├── middleware/     # JWT auth guards
│   ├── models/         # Mongoose schemas
│   ├── routes/         # Express API routes
│   ├── utils/          # Seed data script
│   └── server.js       # Main entry + Socket.io
└── frontend/
    └── src/
        ├── components/
        │   ├── layout/ # Sidebar, Navbar, AppLayout
        │   └── receipt/ # ReceiptModal (KOT + Bill)
        ├── context/    # Auth, Cart, Socket contexts
        ├── pages/      # POS, KDS, Dashboard, etc.
        └── utils/      # Axios API client
```
