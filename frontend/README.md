# Agricultural Supply Chain Management - Frontend

Next.js frontend application for the Agricultural Supply Chain Management System.

## 🚀 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **API Client**: Fetch API
- **Linting**: ESLint

## 📁 Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── src/
│   ├── components/        # React components
│   │   ├── layout/       # Layout components
│   │   └── ui/           # UI components
│   ├── lib/              # Utilities
│   │   ├── api.ts        # API client
│   │   ├── utils.ts      # Utility functions
│   │   └── cn.ts         # Class name utilities
│   └── types/            # TypeScript types
│       └── index.ts      # Type definitions
├── public/               # Static assets
├── .env.local           # Environment variables (local)
├── .env.example         # Environment variables template
└── package.json         # Dependencies
```

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

### 3. Run Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

### 4. Build for Production

```bash
npm run build
npm start
```

## ✅ Task 1: Basic Setup (Completed)

- [x] Environment configuration (.env.local)
- [x] Project structure (src/, components/, lib/, types/)
- [x] API client with authentication support
- [x] TypeScript types for all backend models
- [x] Utility functions (date, number, currency formatting)
- [x] Home page with feature overview

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Backend API Documentation](http://127.0.0.1:8000/api/docs/)

---

**Status**: ✅ Task 1 Complete  
**Date**: 2026-01-17

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
