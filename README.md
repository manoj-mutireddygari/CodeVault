# CodeVault 🚀

> **Automatic LeetCode Solution Sync & Personal Portfolio Catalog**

CodeVault is a full-stack platform and browser extension that automatically captures your accepted LeetCode submissions and pushes them directly to your personal GitHub repository. It provides a sleek, modern web dashboard for tracking problem-solving analytics, viewing streaks, browsing solution code, and managing your catalog.

---

## ✨ Features

### 🧩 Chrome Extension (Manifest V3)
- **Automatic Submission Interception**: Listens natively on `leetcode.com/problems/*` and captures accepted solutions in real-time.
- **Zero-Credential Auth Handshake**: Automatically syncs session identity from the CodeVault web dashboard without exposing raw credentials inside the extension popup.
- **Direct GitHub Uploads**: Formats solutions cleanly with problem metadata, runtime stats, memory usage, and direct links before committing to GitHub.
- **Multi-Language Support**: Automatically formats Python, Java, C++, JavaScript, TypeScript, Rust, Go, C#, Swift, Kotlin, and SQL submissions with proper extensions.
- **Offline Queue & Resiliency**: Built-in background sync queue with local storage fallback (`chrome.storage.local`) for seamless offline handling.

### 📊 Web Dashboard (Next.js 15 & Supabase)
- **Comprehensive Analytics**: Track total solved problems, difficulty distribution (Easy, Medium, Hard), current & longest streaks, monthly solves, and language usage.
- **Solution Vault & Catalog**: Search, filter, and inspect code snippets of your past solutions in a fast, glassmorphic UI.
- **Repository Management**: Configure fine-grained GitHub PAT tokens, target repository names, and folder naming templates.
- **Instant Extension Downloader**: One-click download of `CodeVault.zip` directly compiled from the latest extension build.
- **Data Export & Settings**: Export complete solution histories in JSON format and configure system preferences.

---

## 🛠️ Architecture & Monorepo Structure

CodeVault is structured as an **npm workspace monorepo**:

```
CodeVault/
├── dashboard/        # Next.js 15 Web Application (React 19, Supabase, Tailwind CSS)
├── extension/        # Manifest V3 Chrome Extension (Vite, React, TypeScript)
├── shared/           # Shared TypeScript types, solution schemas, and domain utilities
├── scripts/          # Automation scripts (e.g., zip-extension.js for release bundles)
└── supabase_schema.sql # Database migrations and RLS security policies
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: `v20.0.0` or higher
- **npm**: `v10.0.0` or higher
- **Supabase Account** (for authentication & database synchronization)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/CodeVault.git
cd CodeVault
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file inside the `dashboard/` directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Apply the database schema from `supabase_schema.sql` into your Supabase SQL Editor.

### 3. Run Development Mode
Start both the web dashboard and extension watch mode concurrently:

```bash
# Run web dashboard (http://localhost:3000)
npm run dev:dashboard

# Run extension watch mode
npm run dev:extension
```

### 4. Build & Package Extension
To generate the production extension bundle and create `CodeVault.zip` for release:

```bash
npm run build:extension
```

This compiles `extension/dist` and automatically archives it into `dashboard/public/CodeVault.zip`.

---

## 🔌 Loading the Extension in Browser

1. Build the extension via `npm run build:extension`.
2. Open Chrome (or any Chromium browser like Brave, Edge, or Arc) and navigate to `chrome://extensions`.
3. Enable **Developer mode** in the upper right corner.
4. Click **Load unpacked** and select the `extension/dist/` directory inside this repository.
5. Alternatively, download `CodeVault.zip` from your running dashboard (`/download`), extract it, and load unpacked.

---

## 🌐 Deploying Dashboard to Vercel

1. **Push your code to GitHub**.
2. **Import project into Vercel**:
   - **Root Directory**: `dashboard`
   - **Framework Preset**: Next.js
3. **Configure Environment Variables in Vercel**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. **Update Extension Manifest permissions** if deploying on a custom domain or `*.vercel.app`.

---

## 📜 Available NPM Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev:dashboard` | Starts the Next.js web application on `http://localhost:3000` |
| `npm run dev:extension` | Launches Vite in watch mode for extension development |
| `npm run build:extension` | Builds extension typescript/assets & generates `dashboard/public/CodeVault.zip` |
| `npm run build:dashboard` | Builds optimized production bundle for Next.js dashboard |
| `npm run build` | Builds extension, updates release ZIP, and builds dashboard |
| `npm run typecheck` | Validates TypeScript across all monorepo workspaces |
| `npm run test` | Runs unit tests using Vitest |

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.
