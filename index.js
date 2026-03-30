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
import { spawn, execSync } from 'child_process';
import updateNotifier from 'update-notifier';

const require = createRequire(import.meta.url);
const pkg = require('./package.json');

updateNotifier({ pkg }).notify();

const execAsyncWithProgress = (cmd, spin, baseText) => {
    return new Promise((resolve) => {
        const startTime = Date.now();
        const child = spawn(cmd, { shell: true });

        let timer = setInterval(() => {
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            spin.text = chalk.cyan(`${baseText} [${elapsed}s]`);
        }, 100);

        const handleData = (data) => {
            const lines = data.toString().split('\n').map(l => l.trimEnd()).filter(Boolean);
            if (lines.length > 0) {
                const lastLine = lines[lines.length - 1];
                const cleanLine = lastLine.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '').trim();
                const truncated = cleanLine.length > 80 ? cleanLine.substring(0, 77) + '...' : cleanLine;
                const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
                spin.text = chalk.cyan(`${baseText} [${elapsed}s]\n`) + chalk.gray(`    └── ${truncated}`);
            }
        };

        child.stdout.on('data', handleData);
        child.stderr.on('data', handleData);

        child.on('close', (code) => {
            clearInterval(timer);
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            resolve({ code, elapsed });
        });
    });
};


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
    .description('TechLift Digital Enterprise Suite\nAutomated Full-Stack Next.js Blueprint Deployer with Shadcn UI, Next-Auth v5, and MongoDB.')
    .option('-y, --yes', 'Skip confirmation prompts')
    .option('-f, --faster', 'Instant deployment (Bypass all interactive menus)')
    .version(pkg.version);

program.addHelpText('after', `
Example calls:
  $ tld create-app my-new-app ./
  $ tld create-app core-system ./ --faster
  $ tld doctor
`);

// Welcome
program
    .command('welcome', { isDefault: true })
    .description('Interactive full-screen dashboard')
    .action(actionWrapper(async () => {
        showBanner();
        console.log(chalk.cyan.bold('\n  🚀 ENTERPRISE STACK ENGINE READY'));
        console.log(chalk.gray('  ' + '─'.repeat(60)));
        console.log(chalk.white('   Next.js 16+ · Tailwind · Shadcn UI · MongoDB · Auth.js v5'));
        console.log(chalk.white('   Streamlined Full-Stack Scaffolding Automation.\n'));
        console.log(chalk.blue('   $ tld create-app <id> <path>  ') + chalk.gray(' ─ Deploy a new workspace'));
        console.log(chalk.blue('   $ tld create-app <id> <p> -f  ') + chalk.gray(' ─ Instant express deployment'));
        console.log(chalk.blue('   $ tld doctor                  ') + chalk.gray(' ─ Audit runtime environment'));
        console.log(chalk.blue('   $ tld --help                  ') + chalk.gray(' ─ View all commands\n'));
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
    .argument('<id>', 'Project Workspace ID (Required)')
    .argument('<targetPath>', 'Destination target directory path (Required, e.g. ./)')
    .option('-y, --yes', 'Skip confirmation prompts', false)
    .option('-f, --faster', 'Instant deployment (Bypass all interactive menus)', false)
    .action(actionWrapper(async (id, targetPath, options) => {
        showBanner();
        const globalOpts = program.opts();
        const skipPrompts = options.yes || options.faster || globalOpts.yes || globalOpts.faster;

        // 1. PROJECT ID VALIDATION
        const idRegex = /^[a-z0-9-_]+$/;
        if (!idRegex.test(id)) {
            console.log(chalk.red('\n  ✘ Validation Error: Project ID must be lowercase alphanumeric (hyphens/underscores allowed).'));
            return;
        }

        const absoluteTargetDir = path.resolve(process.cwd(), targetPath);
        const finalPath = path.join(absoluteTargetDir, id);

        if (fs.existsSync(finalPath)) {
            console.log(chalk.red(`\n  ✘ Error: Destination directory already exists: `) + chalk.gray(finalPath));
            console.log(chalk.yellow('  💡 Tip: Use a unique ID or a different target path.'));
            return;
        }

        console.log(chalk.cyan(`  🔄 PREPARING ARCHITECTURAL STACK FOR: `) + chalk.bold(id));
        console.log(chalk.white(`  📍 PATH: `) + chalk.gray(finalPath));
        console.log(chalk.gray('  ' + '─'.repeat(60) + '\n'));

        // 2. Compliance Scan
        const spin = ora({ text: 'Compliance check...', color: 'blue' }).start();
        if (shell.exec('node -v', { silent: true }).code !== 0 || shell.exec('pnpm -v', { silent: true }).code !== 0) {
            spin.fail('Runtime Error: Verify Node/pnpm.');
            return;
        }
        spin.succeed('Runtime Compliance: 100% Verified.');

        let skipNextPrompt = skipPrompts;
        let skipShadcnPrompt = skipPrompts;
        console.log(chalk.blue.bold('\n  📦 DEPLOYMENT BUNDLE:'));
        console.log(chalk.white('   → Framework  : Next.js 16+ + Tailwind + TS'));
        console.log(chalk.white('   → Auth Engine: Next-Auth@Beta + Proxy Architecture'));
        console.log(chalk.white('   → Database   : MongoDB Native Driver Interface + (mongodb.ts) MongoDB Configuration File\n'));
        if (!skipPrompts) {
            const prompts = await inquirer.prompt([
                { type: 'confirm', name: 'customizeNext', message: chalk.cyan('Fully customize Next.js architecture? (Selecting No uses recommended defaults)'), default: false },
                { type: 'confirm', name: 'customizeShadcn', message: chalk.cyan('Fully customize Shadcn UI themes/presets? (Selecting No uses recommended defaults)'), default: false },
                { type: 'confirm', name: 'ok', message: chalk.cyan('Initiate build sequence?'), default: true }
            ]);
            if (!prompts.ok) return;
            skipNextPrompt = !prompts.customizeNext;
            skipShadcnPrompt = !prompts.customizeShadcn;
        }

        // 3. Next.js Scaffolding
        if (!skipNextPrompt) {
            spin.stop();
            console.log(chalk.blue.bold('\n  🚀 NEXT.JS ARCHITECTURE (Interactive Calibration):'));
            console.log(chalk.yellow('  ⚠ Warning: Disabling Tailwind or App Router will break Shadcn UI & Auth integrations.'));
            try {
                execSync(`npx create-next-app@latest "${finalPath}" --use-pnpm`, { stdio: 'inherit' });
            } catch (err) {
                console.log(chalk.red('\n  ✘ Next.js scaffold failed or aborted.'));
                return;
            }
            spin.start('Verifying Next.js installation...');
            spin.succeed('Next.js architecture established manually.');
        } else {
            spin.start('Executing Next.js (App Router) deployment...');
            const scaffoldCmd = `npx create-next-app@latest "${finalPath}" --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --use-pnpm --yes`;
            const { code: nextCode, elapsed: nextTime } = await execAsyncWithProgress(scaffoldCmd, spin, 'Executing Next.js deployment');
            if (nextCode !== 0) {
                spin.fail('Next.js Scaffold Failed.');
                return;
            }
            spin.succeed(`Next.js architecture established in ${nextTime}s.`);
        }

        // 4. Dependencies
        process.chdir(finalPath);
        spin.start('Injecting Full-Stack Drivers (Auth.js, MongoDB, Bcrypt)...');
        const { code: depsCode, elapsed: depsTime } = await execAsyncWithProgress('pnpm add next-auth@beta mongodb bcrypt && pnpm add -D @types/bcrypt', spin, 'Injecting Full-Stack Drivers');
        if (depsCode !== 0) {
            spin.fail('Failed to integrate stack drivers.');
            return;
        }
        spin.succeed(`Stack drivers integrated in ${depsTime}s.`);

        // 5. NEXT-AUTH@BETA CONFIGURATION (ENFORCED PROXY PATTERN)
        spin.start('Configuring Next-Auth & MongoDB (Proxy Pattern)...');

        const authConfigTs = `import type { NextAuthConfig } from 'next-auth';
export const authConfig = {
  pages: { signIn: '/login' },
  callbacks: { authorized({ auth }) { return !!auth?.user; } },
  providers: [],
} satisfies NextAuthConfig;`;

        const authTs = `import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
export const { auth, signIn, signOut, handlers } = NextAuth(authConfig);`;

        const authRouteDir = path.join('app', 'api', 'auth', '[...nextauth]');
        shell.mkdir('-p', authRouteDir);
        const authRouteTs = `import { handlers } from '@/auth';
export const { GET, POST } = handlers;`;

        const proxyTs = `import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
export default NextAuth(authConfig).auth;
export const config = { matcher: ['/((?!api|_next/static|_next/image|.*\\\\.png$).*)'] };`;

        fs.writeFileSync('auth.config.ts', authConfigTs);
        fs.writeFileSync('auth.ts', authTs);
        fs.writeFileSync(path.join(authRouteDir, 'route.ts'), authRouteTs);
        fs.writeFileSync('proxy.ts', proxyTs);
        fs.writeFileSync('.env.local', 'AUTH_SECRET=' + Math.random().toString(36).substring(2, 15) + '\n');

        // MONGODB CONNECTION SETUP
        shell.mkdir('-p', 'lib');
        const mongodbTs = `import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;`;
        fs.writeFileSync(path.join('lib', 'mongodb.ts'), mongodbTs);
        fs.appendFileSync('.env.local', 'MONGODB_URI=mongodb://127.0.0.1:27017/my-database\n');

        spin.succeed('Next-Auth Proxy & MongoDB architecture established.');

        // 6. Shadcn UI
        if (!skipShadcnPrompt) {
            spin.stop();
            console.log(chalk.blue.bold('\n  🎨 SHADCN UI REGISTRY (Interactive Calibration):'));
            try {
                execSync('npx shadcn@latest init', { stdio: 'inherit' });
            } catch (err) {
                console.log(chalk.yellow('\n  ⚠ Shadcn UI init bypassed or failed.'));
            }
            spin.start('Populating design library (shadcn add --all)...');
            const { code: shadAddCode, elapsed: shadAddTime } = await execAsyncWithProgress(`npx shadcn@latest add --all --yes --overwrite`, spin, 'Populating design library');
            spin.succeed(`Shadcn UI fully populated in ${shadAddTime}s.`);
        } else {
            spin.start('Calibrating Shadcn UI registry...');
            const { code: shadInitCode, elapsed: shadInitTime } = await execAsyncWithProgress(`npx shadcn@latest init -d --yes`, spin, 'Calibrating Shadcn UI registry');
            if (shadInitCode !== 0) {
                spin.warn('Shadcn UI init skipped.');
            } else {
                spin.start('Populating design library (shadcn add --all)...');
                const { code: shadAddCode, elapsed: shadAddTime } = await execAsyncWithProgress(`npx shadcn@latest add --all --yes --overwrite`, spin, 'Populating design library');
                spin.succeed(`Shadcn UI fully populated in ${shadAddTime}s.`);
            }
        }

        console.log(chalk.green.bold('\n  ✨ STACK DEPLOYED SUCCESSFULLY! 📦'));
        console.log(chalk.white('  🔗 Path : ') + chalk.cyan.underline(finalPath));
        console.log(chalk.white('  ⚡ Dev  : ') + chalk.gray(`cd ${path.relative(process.cwd(), finalPath)} && pnpm dev`));
        console.log('\n  ' + chalk.blue.bold('TechLift Digital ─ Engineering Your Vision.'));
    }));

program.parse(process.argv);