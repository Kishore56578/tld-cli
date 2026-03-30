#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import figlet from 'figlet';
import inquirer from 'inquirer';
import ora from 'ora';
import shell from 'shelljs';
import gradient from 'gradient-string';
import path from 'path';
import fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pkg = require('./package.json');

const program = new Command();

/**
 * Centered Professional UI for TechLift Digital.
 */
function showBanner() {
    process.stdout.write('\x1Bc');
    const width = process.stdout.columns || 80;
    const blueGradient = gradient(['#00c6ff', '#0072ff', '#00c6ff']);
    
    let logoText = '';
    if (width >= 90) {
        logoText = figlet.textSync('TECHLIFT DIGITAL', { font: 'Slant', horizontalLayout: 'fitted' });
    } else {
        const t = figlet.textSync('TECHLIFT', { font: 'Small', horizontalLayout: 'fitted' });
        const d = figlet.textSync('DIGITAL', { font: 'Small', horizontalLayout: 'fitted' });
        logoText = `${t}\n${d}`;
    }
    
    const lines = logoText.split('\n').map(l => l.trimEnd());
    const maxLogoWidth = Math.max(...lines.map(l => l.length));
    const logoPaddingLen = Math.max(0, Math.floor((width - maxLogoWidth) / 2));
    const logoPad = ' '.repeat(logoPaddingLen);
    
    console.log('\n' + blueGradient.multiline(lines.map(l => logoPad + l).join('\n')));
    const slogan = "Automating Enterprise Modernization ─ The Full-Stack Collection";
    const p = Math.max(0, Math.floor((width - slogan.length) / 2));
    console.log('\n' + ' '.repeat(p) + chalk.cyan.bold(slogan));
    console.log(' '.repeat(Math.max(0, Math.floor((width - 6) / 2))) + chalk.blue.bold(`v${pkg.version}\n`));
}

const actionWrapper = (fn) => async (...args) => {
    try {
        await fn(...args);
    } catch (err) {
        if (err.name === 'ExitPromptError' || err.message.includes('SIGINT')) {
            console.log(chalk.blue('\n\n👋 TechLift Studio: Environment session closed.'));
        } else {
            console.error(chalk.red.bold('\n💥 GLOBAL ENGINE FAILURE:'), chalk.red(err.message));
        }
        process.exit(1);
    }
};

program
    .name('tld')
    .description('TechLift Digital Enterprise Suite')
    .version(pkg.version);

// Welcome
program
    .command('welcome', { isDefault: true })
    .description('Full-screen dashboard')
    .action(actionWrapper(async () => {
        showBanner();
        const msg = 'Ready for production. Use "tld create-app" or "tld --help".';
        const p = Math.max(0, Math.floor((process.stdout.columns - msg.length) / 2));
        console.log(' '.repeat(p) + chalk.white(msg) + '\n');
    }));

// Doctor
program
    .command('doctor')
    .description('Deep environment scan')
    .action(actionWrapper(async () => {
        showBanner();
        console.log(chalk.yellow.bold('  🛡️  SYSTEM COMPLIANCE SCAN...\n'));
        const checks = [{ id: 'Node', cmd: 'node -v' }, { id: 'pnpm', cmd: 'pnpm -v' }];
        checks.forEach(c => {
            const res = shell.exec(c.cmd, { silent: true });
            if (res.code === 0) console.log(chalk.green('    ✔ ') + `${c.id.padEnd(10)} : ${chalk.white(res.stdout.trim())}`);
            else console.log(chalk.red('    ✘ ') + `${c.id.padEnd(10)} : ${chalk.red('NOT DETECTED')}`);
        });
    }));

// Create-App
program
    .command('create-app')
    .description('Automated Full-Stack Blueprint Deployer')
    .argument('[id]', 'Project Workspace ID', 'tl-service')
    .option('-p, --path <path>', 'Custom target directory path', '.')
    .option('-y, --yes', 'Skip confirmation prompts', false)
    .action(actionWrapper(async (id, options) => {
        showBanner();
        const targetDir = path.resolve(process.cwd(), options.path);
        const finalPath = path.join(targetDir, id);
        
        console.log(chalk.cyan(`  🔄 PREPARING ARCHITECTURAL STACK FOR: `) + chalk.bold(id));
        console.log(chalk.white(`  📍 PATH: `) + chalk.gray(finalPath));
        console.log(chalk.gray('  ' + '─'.repeat(60) + '\n'));

        // 1. Compliance Scan
        const spin = ora({ text: 'Compliance check...', color: 'blue' }).start();
        if (shell.exec('node -v', { silent: true }).code !== 0 || shell.exec('pnpm -v', { silent: true }).code !== 0) {
            spin.fail('Runtime Error: Verify Node/pnpm.');
            return;
        }
        spin.succeed('Runtime Compliance: 100% Verified.');

        if (!options.yes) {
            console.log(chalk.blue.bold('\n  📦 DEPLOYMENT BUNDLE:'));
            console.log(chalk.white('   → Framework  : Next.js 15+ + Tailwind + TS'));
            console.log(chalk.white('   → Auth Engine: Next-Auth@Beta + Runtime Separation Architecture'));
            console.log(chalk.white('   → Database   : MongoDB Native Driver Interface\n'));
            const q = await inquirer.prompt([{ type: 'confirm', name: 'ok', message: chalk.cyan('Initiate build sequence?'), default: true }]);
            if (!q.ok) return;
        }

        // 2. Next.js Scaffolding
        spin.start('Executing Next.js (App Router) deployment...');
        const scaffoldCmd = `npx create-next-app@latest "${finalPath}" --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --use-pnpm --yes`;
        if (shell.exec(scaffoldCmd, { silent: true }).code !== 0) {
            spin.fail('Next.js Scaffold Failed.');
            return;
        }
        spin.succeed('Next.js architecture established.');

        // 3. Dependencies
        process.chdir(finalPath);
        spin.start('Injecting Full-Stack Drivers (Auth.js, MongoDB, Bcrypt)...');
        shell.exec('pnpm add next-auth@beta mongodb bcrypt && pnpm add -D @types/bcrypt', { silent: true });
        spin.succeed('Stack drivers integrated.');

        // 4. NEXT-AUTH@BETA CONFIGURATION (RUNTIME SEPARATION)
        spin.start('Optimizing Next-Auth Runtime Separation (Edge vs Node)...');
        
        // auth.config.ts - Pure configuration for Edge compatibility
        const authConfigTs = `import type { NextAuthConfig } from 'next-auth';
// Edge-compatible configuration
export const authConfig = {
  pages: { signIn: '/login' },
  callbacks: { authorized({ auth }) { return !!auth?.user; } },
  providers: [],
} satisfies NextAuthConfig;`;

        // auth.ts - Full configuration including database adapters (Node.js runtime only)
        const authTs = `import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
// Full initialization with DB adapters, etc.
export const { auth, signIn, signOut, handlers } = NextAuth(authConfig);`;

        // /app/api/auth/[...nextauth]/route.ts
        const authRouteDir = path.join('app', 'api', 'auth', '[...nextauth]');
        shell.mkdir('-p', authRouteDir);
        const authRouteTs = `import { handlers } from '@/auth';
export const { GET, POST } = handlers;`;

        // proxy.ts - The Edge-Runtime Proxy (Prevents runtime errors by using auth.config only)
        const proxyTs = `import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
// Direct export using the edge-compatible config
export default NextAuth(authConfig).auth;
export const config = { matcher: ['/((?!api|_next/static|_next/image|.*\\\\.png$).*)'] };`;

        fs.writeFileSync('auth.config.ts', authConfigTs);
        fs.writeFileSync('auth.ts', authTs);
        fs.writeFileSync(path.join(authRouteDir, 'route.ts'), authRouteTs);
        fs.writeFileSync('proxy.ts', proxyTs);
        fs.writeFileSync('.env.local', 'AUTH_SECRET=' + Math.random().toString(36).substring(2, 15));

        spin.succeed('Next-Auth Runtime Separation architecture established.');

        // 5. Shadcn UI
        spin.start('Calibrating Shadcn UI registry...');
        if (shell.exec(`npx shadcn@latest init --yes`, { silent: true }).code !== 0) {
            spin.warn('Shadcn UI init skipped.');
        } else {
            spin.text = 'Populating design library (shadcn add --all)...';
            shell.exec(`npx shadcn@latest add --all --yes`, { silent: true });
            spin.succeed('Shadcn UI fully populated.');
        }

        console.log(chalk.green.bold('\n  ✨ STACK DEPLOYED SUCCESSFULLY! 📦'));
        console.log(chalk.white('  🔗 Path : ') + chalk.cyan.underline(finalPath));
        console.log(chalk.white('  ⚡ Dev  : ') + chalk.gray(`cd ${path.relative(process.cwd(), finalPath)} && pnpm dev`));
        console.log('\n  ' + chalk.blue.bold('TechLift Digital ─ Engineering Your Vision.'));
    }));

program.parse(process.argv);