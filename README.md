# Domari

**Simple, powerful property finance management for small landlords.**

Domari eliminates spreadsheet chaos by providing an intuitive platform to track rental income, expenses, and generate tax-ready reports—all in one place.

🌐 **Live App:** [domari.app](https://domari.app)

---

## 🎯 What is Domari?

A property finance management tool designed for small landlords and property managers who want to:
- **Track transactions** - Record rent payments, expenses, and maintenance costs
- **Visualize performance** - Cash flow trends, expense breakdowns, and property comparisons
- **Export for taxes** - Download transaction data as CSV for your accountant
- **Make better decisions** - Data-driven insights across your entire portfolio

---

## 🏗️ Project Structure

```
property-management-app/
├── client/                      # Next.js 15 frontend application
├── CLAUDE.md                    # Development guidelines and architecture
├── STRIPE_REUSABILITY_GUIDE.md  # Stripe integration documentation
└── README.md                    # This file
```

All application code lives in the `/client` directory. This is a mono-repo structure with the frontend as the primary component.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 15 with App Router
- **Database:** PostgreSQL (Supabase)
- **Authentication:** NextAuth.js v5 (Google OAuth + credentials)
- **UI:** TailwindCSS v4 + shadcn/ui
- **Payments:** Stripe (subscription billing)
- **Storage:** Supabase Storage + AWS S3
- **Hosting:** Vercel

---

## ✨ Key Features

### Core Functionality
- ✅ **Multi-property portfolio management** - Track multiple rental properties
- ✅ **Transaction tracking** - Income & expenses with pre-built categories
- ✅ **Analytics dashboard** - Cash flow trends, expense breakdowns, property rankings
- ✅ **CSV export** - Export transactions for tax preparation
- ✅ **Property images** - Upload and manage property photos

### Financial Features
- ✅ **Multi-currency support** - EUR, USD, GBP, AUD, CAD, CHF
- ✅ **Real-time calculations** - Cash flow, ROI, expense ratios
- ✅ **Property comparison** - Compare performance across your portfolio
- ✅ **Monthly metrics** - Automated tracking of monthly performance

### Subscription & Access
- ✅ **3-tier pricing** - Starter (10 properties), Pro (50 properties), Business (unlimited)
- ✅ **14-day free trial** - No credit card required
- ✅ **Stripe billing** - Managed subscriptions with payment portal

---

## 🚀 Quick Start

### For Developers

1. **Navigate to the client directory:**
   ```bash
   cd client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your credentials
   ```

4. **Set up database:**
   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

**For complete setup instructions, see [client/README.md](./client/README.md)**

---

## 📖 Documentation

- **[client/README.md](./client/README.md)** - Complete technical setup, development commands, and deployment guide
- **[CLAUDE.md](./CLAUDE.md)** - Architecture patterns, coding standards, and best practices
- **[STRIPE_REUSABILITY_GUIDE.md](./STRIPE_REUSABILITY_GUIDE.md)** - Stripe integration implementation details

---

## 🌟 Current Status

**Production:** Live at [domari.app](https://domari.app)

**Version:** 0.1.0 (MVP)

**Last Updated:** October 2025

---

## 📞 Support

For technical questions and development guidelines, see [CLAUDE.md](./CLAUDE.md) or create an issue in the repository.

For product support, contact: support@domari.app

---

Built for landlords who deserve better financial tools.
