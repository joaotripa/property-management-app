# Domari

**Simple, powerful property investment tracker for landlords and property investors.**

Domari eliminates spreadsheet chaos by providing an intuitive platform to track rental income, expenses, and understand your investment performance—all in one place.

🌐 **Live App:** [domari.app](https://domari.app)

---

## 🎯 What is Domari?

Domari transforms property investment tracking from chaotic spreadsheet juggling into clear, actionable insights. Built specifically for landlords and property investors who are tired of losing track of their investments.

The reality is that most landlords are flying blind—rent comes in, but after repairs, taxes, and unexpected costs, they're not sure if they're actually building wealth or just breaking even. Domari changes that.

Instead of scattered Excel files and tax season panic, Domari gives you:

- **Track income and expenses** - Add properties, add transactions, keep everything organized
- **Visualize performance** - Interactive charts for cash flow trends, income vs expenses, expense breakdowns
- **Monitor ROI** - Automatic calculations of cash flow, ROI percentage, expense ratios per property
- **Compare properties** - Property performance rankings to see which investments perform best
- **Export for taxes** - CSV export with categories, dates, amounts for accountants

**Geographic Focus:** While Domari focuses on serving the European market with EUR as the primary currency and localized features, we welcome and support landlords from the United States and other global markets. Our multi-currency support ensures the platform works effectively regardless of location.

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

- ✅ **Multi-property portfolio tracking** - Track multiple rental properties
- ✅ **Property tracking with images** - Upload and manage property photos
- ✅ **Transaction tracking** - Income & expenses with pre-built categories
- ✅ **CSV export** - Export transactions for tax preparation
- ✅ **Dashboard overview** - KPIs and recent activity at a glance

### Investment Analytics

- ✅ **Cash flow trends** - Track income and expenses over time
- ✅ **ROI calculation** - Automatic return on investment percentage per property
- ✅ **Expense breakdown** - See where your money goes by category
- ✅ **Property performance comparison** - Rank properties by investment performance
- ✅ **Income vs expenses charts** - Visualize financial trends
- ✅ **Time range filtering** - Analyze performance by semester or year
- ✅ **Per-property or portfolio-wide views** - Drill down or see the big picture

### Financial Features

- ✅ **Multi-currency support** - EUR, USD, GBP, AUD, CAD, CHF
- ✅ **Real-time calculations** - Cash flow, ROI, expense ratios
- ✅ **Monthly metrics** - Automated tracking of monthly investment performance

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

Built for landlords and property investors who want clarity, not complexity.
