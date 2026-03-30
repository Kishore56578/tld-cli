# 🚀 TechLift Digital CLI ─ Enterprise Suite Engine

**Tech-Stack: Next.js 15+ | Next-Auth@Beta | Shadcn UI | MongoDB | Bcrypt | pnpm**

The TechLift Digital CLI is an automated full-stack engineering engine. It provides high-performance architectural scaffolding, environment audits, and production-ready deployments for modern enterprise web projects.

---

## 📋 Available Commands & Usage

| Command | Args | Options | Description |
| :--- | :--- | :--- | :--- |
| `welcome` | N/A | N/A | (Default) Displays centered Studio GUI dashboard. |
| `doctor` | N/A | N/A | Performs deep Node.js & pnpm environment audit. |
| `create-app` | `[id]` | `-p <path>`, `-y` | Initializes full-stack Next.js blueprint. |

### 🛠️ `create-app` Flags
- `id`: (Optional) Project folder name. Default: `tl-service`.
- `-p, --path <path>`: (Optional) Custom target directory. Default: `.`.
- `-y, --yes`: (Optional) Bypasses confirmation summary for automated build pipelines.

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
- **`auth.config.ts`**: Contains pure, Edge-compatible configuration (callbacks, sign-in pages).
- **`auth.ts`**: Full Node.js initialization (exports `auth`, `signIn`, `signOut`).
- **`proxy.ts`**: Dedicated **Edge Middleware Proxy**. Uses `NextAuth(authConfig).auth` directly to remain lightweight and compatible with the Edge runtime.
- **`/app/api/auth/[...nextauth]/route.ts`**: Standardized API route handlers.
- **`.env.local`**: Automatically generates and injects a secure `AUTH_SECRET`.

### 4. Design System Registry
- **`shadcn init`**: Automated initialization.
- **`shadcn add --all`**: Populates the project with the entire official shadcn component registry for immediate UI development.

---

## 🎨 Visual & Technical Features
- **Mathematical Centering**: Logo and UI components are centered row-by-row based on `process.stdout.columns`.
- **Adaptive Stacking**: Branding logo (TECHLIFT DIGITAL) automatically stacks vertically on narrow terminals to prevent layout breakage.
- **Context-Aware Error Handling**: Step-specific Try/Catch blocks with prescriptive "💡 Tips" for resolution.
- **Premium Themes**: Uses `gradient-string` (Blue-to-Cyan) and `boxen` for high-fidelity interactive state visualization.

---

## 🔧 Installation & Contribution
1. Ensure `node` (Check `tld doctor`) and `pnpm` are in your PATH.
2. Clone the repository and run `pnpm install`.
3. Executable: `node index.js`.

**TechLift Digital ─ Engineering Your Vision.**  
[Official Portal](https://www.techliftdigital.in/)
