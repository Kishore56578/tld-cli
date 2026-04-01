# 🚀 TechLift Digital CLI ─ Enterprise Suite Engine

**Tech-Stack: Next.js 16+ | Next-Auth@Beta | Shadcn UI | MongoDB | Bcrypt | pnpm**

The TechLift Digital CLI is an automated full-stack engineering engine. It provides high-performance architectural scaffolding, environment audits, and production-ready deployments for modern enterprise web projects. Designed to deploy Next.js 16+, Shadcn UI, Next-Auth v5, and MongoDB architectures instantly.

## 🎯 The Problem It Solves

Modern full-stack web development requires significant repetitive boilerplate. Setting up a production-ready Next.js 16 application with secure Auth.js v5 (handling Edge runtime proxies), configuring a reliable Vercel/MongoDB connection singleton, and individually initializing 45+ Shadcn UI components can easily take an experienced developer **45 to 60+ minutes** of tedious manual configuration before writing a single line of business logic.

This CLI radically optimizes that workflow. 

**What it achieves in ~120 seconds:**
- ⚡ Eliminates manual framework configurations and Next-Auth Edge runtime debugging.
- ⚡ Populates the entire Shadcn UI component design system instantly.
- ⚡ Enforces enterprise-grade architectural patterns (Proxy architectures, DB singletons) natively out of the box.
- ⚡ **Time Saved**: Bypasses roughly **1 hour of redundant architectural setup** on every new project you start.

---

## 📋 Available Commands & Usage

| Command | Args | Options | Description |
| :--- | :--- | :--- | :--- |
| `welcome` | N/A | N/A | (Default) Interactive full-screen dashboard displaying stack breakdown and command legends. |
| `doctor` | N/A | N/A | Performs deep Node.js & pnpm environment audit. |
| `create-app` | `<id> <path>` | `-y`, `-f`, `-r` | Initializes full-stack Next.js blueprint. |

### 🛠️ `create-app` Required Arguments
- **`id`**: (Required) Project Workspace ID. (e.g. `my-new-app`).
- **`targetPath`**: (Required) Destination directory. (e.g. `./` for current path).
- **`-y, --yes`**: Skip confirmation limits for standard build pipelines.
- **`-f, --faster`**: Instant deployment. Bypasses all interactive UI/framework customization menus for maximum background execution speed.
- **`-r, --run`**: Auto-run server. Instantly boots the local `pnpm dev` server immediately after the deployment sequence completes.

### 💡 Example Commands
```bash
# Standard interactive deployment
tld create-app my-workspace ./

# Express deployment (Bypass prompts)
tld create-app internal-dash ./ -f

# Express deployment + Auto-start Next.js server on finish
tld create-app prod-portal ./ -f -r
```

---

## 🏗️ Core Implementation Details

### 1. Framework Scaffolding
- Uses `npx create-next-app@latest` with:
  - TypeScript, ESLint, Tailwind CSS, App Router.
  - `--use-pnpm` enforced for performance.
  - `--no-src-dir` & `--import-alias "@/*"`.

### 2. Full-Stack Driver Injection
- Automated `pnpm add` for:
  - `next-auth@beta`, `mongodb` (native), `bcrypt`.
  - `@types/bcrypt` (dev-dependency).

### 3. Next-Auth@Beta (Auth.js v5) Architecture
To prevent **Edge Runtime errors** in Next.js 16+, the CLI implements **Runtime Separation Architecture**:
- **`auth.config.ts`**: Contains pure, Edge-compatible configuration.
- **`auth.ts`**: Full Node.js initialization (exports `auth`, `signIn`, `signOut`).
- **`proxy.ts`**: Dedicated **Edge Middleware Proxy**. Uses `NextAuth(authConfig).auth` directly to remain lightweight and compatible with the Edge runtime.
- **`/app/api/auth/[...nextauth]/route.ts`**: Standardized API route handlers.
- **`.env.local`**: Automatically generates and injects a secure `AUTH_SECRET`.

### 4. Design System Registry
- **`shadcn init`**: Automated initialization.
- **`shadcn add --all`**: Populates the project with the entire official shadcn component registry for immediate UI development.

### 5. Production-Grade Database Configuration
- **`lib/mongodb.ts`**: Automatically scaffolds the official Vercel/MongoDB singleton architectural pattern to handle Hot Module Replacements without connection drain.
- **Environment Automation**: Directly configures `MONGODB_URI` connection strings securely alongside NextAuth details within `.env.local`.

---

## 💖 Support the Suite

If the TechLift Digital CLI has accelerated your enterprise engineering, consider supporting our mission to modernize full-stack development through high-performance automation.

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-techreviver-yellow?style=for-the-badge&logo=buy-me-a-coffee)](https://www.buymeacoffee.com/techreviver)

---

## 🎨 Visual & Technical Features
- **Live Non-Blocking execution**: Tasks stream `stdout` directly into the UI spinner with duration timers to guarantee loaders never freeze, even during massive installations.
- **Automatic Update Notifier**: Evaluates registry distribution tags asynchronously and alerts the developer if a newer version of the CLI is published.
- **Mathematical Centering**: Logo and UI components are centered row-by-row based on `process.stdout.columns`.
- **Adaptive Stacking**: Branding logo (TECHLIFT DIGITAL) automatically stacks vertically on narrow terminals to prevent layout breakage.
- **Context-Aware Error Handling**: Step-specific Try/Catch blocks with prescriptive "💡 Tips" for resolution.
- **Premium Themes**: Uses `gradient-string` (Blue-to-Cyan).

---

## 🔧 Installation & Contribution
1. Ensure `node` (Check `tld doctor`) and `pnpm` are in your PATH.
2. Clone the repository and run `pnpm install`.
3. Executable: `node index.js`.

---

## 🤖 Coming Soon: AI Engineering Agents (`tld coder`)

We are actively developing the next massive evolution of the TechLift ecosystem: **`tld coder`**.
The next major update will deploy autonomous **AI Coding Agents directly into your terminal**.

Powered by cutting-edge intelligence (integrating **Sarvam AI** and our own proprietary models custom-trained specifically for coding), this future update will empower you to generate logic, trace errors, and have an AI pair-programmer executing natively inside your local CLI environment! Stay tuned!

---

**Made with ❤️ by TechLift Digital ─ Engineering Your Vision.**  
[Official Portal](https://techliftdigital.in/cli)
