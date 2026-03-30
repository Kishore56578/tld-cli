#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import figlet from 'figlet';
import inquirer from 'inquirer';
import ora from 'ora';
import shell from 'shelljs';
import gradient from 'gradient-string';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pkg = require('./package.json');

const program = new Command();

/**
 * Centered Professional UI for TechLift Digital.
 * Uses Block-Width centering for ASCII art.
 */
function showBanner() {
    process.stdout.write('\x1Bc');
    
    const width = process.stdout.columns || 80;
    const blueGradient = gradient(['#00c6ff', '#0072ff', '#00c6ff']);
    
    let logoText = '';
    const label1 = 'TECHLIFT';
    const label2 = 'DIGITAL';
    
    // Choose font & layout based on width
    if (width >= 105) {
        logoText = figlet.textSync('TECHLIFT DIGITAL', { font: 'Slant', horizontalLayout: 'fitted' });
    } else {
        const t = figlet.textSync(label1, { font: 'Small', horizontalLayout: 'fitted' });
        const d = figlet.textSync(label2, { font: 'Small', horizontalLayout: 'fitted' });
        logoText = `${t}\n${d}`;
    }
    
    // MATHEMATICAL BLOCK CENTERING
    const lines = logoText.split('\n').map(l => l.trimEnd());
    const maxLogoWidth = Math.max(...lines.map(l => l.length));
    const logoPaddingLen = Math.max(0, Math.floor((width - maxLogoWidth) / 2));
    const logoPad = ' '.repeat(logoPaddingLen);
    
    console.log('\n' + blueGradient.multiline(lines.map(l => logoPad + l).join('\n')));
    
    // Slogan and Version Centering
    const slogan = "A collection of developer tools you won't be able to live without!";
    const versionLine = `v${pkg.version}`;
    
    [slogan, versionLine].forEach(text => {
        const p = Math.max(0, Math.floor((width - text.length) / 2));
        console.log(' '.repeat(p) + (text === versionLine ? chalk.blue.bold(text) : chalk.cyan.bold(text)));
    });

    console.log('\n');
    
    // Footer Section
    const footerText = `TechLift Digital Standard v${pkg.version}`;
    const dividerLen = Math.min(width - 10, 60);
    const dividerPadding = Math.max(0, Math.floor((width - dividerLen) / 2));
    const textPadding = Math.max(0, Math.floor((width - footerText.length) / 2));
    
    console.log(' '.repeat(dividerPadding) + chalk.gray('─'.repeat(dividerLen)));
    console.log(' '.repeat(textPadding) + chalk.white(footerText));
    console.log(' '.repeat(dividerPadding) + chalk.gray('─'.repeat(dividerLen)));
    console.log('\n');
}

const actionWrapper = (fn) => async (...args) => {
    try {
        await fn(...args);
    } catch (err) {
        if (err.name === 'ExitPromptError' || err.message.includes('SIGINT')) {
            console.log(chalk.blue('\n\n👋 TechLift: Terminal session closed.'));
        } else {
            console.error(chalk.red.bold('\n💥 ERROR:'), chalk.red(err.message));
        }
        process.exit(0);
    }
};

program
    .name('tld')
    .description('TechLift Digital - Enterprise Suite CLI')
    .version(pkg.version);

// Welcome
program
    .command('welcome', { isDefault: true })
    .description('Corporate workspace dash')
    .action(actionWrapper(async () => {
        showBanner();
        const msg = 'Press tld --help to explore enterprise modules.';
        const p = Math.max(0, Math.floor((process.stdout.columns - msg.length) / 2));
        console.log(' '.repeat(p) + chalk.white(msg));
    }));

// Doctor
program
    .command('doctor')
    .description('Environment diagnostic')
    .action(actionWrapper(async () => {
        showBanner();
        console.log(chalk.yellow.bold('  🔍 PERFORMING SCAN...\n'));
        const checks = [{ id: 'Node', cmd: 'node -v' }, { id: 'pnpm', cmd: 'pnpm -v' }];
        checks.forEach(c => {
            const res = shell.exec(c.cmd, { silent: true });
            console.log(chalk.green('    ✔ ') + `${c.id.padEnd(10)} : ${chalk.white(res.stdout.trim())}`);
        });
    }));

// Create-App
program
    .command('create-app')
    .description('Initialize high-end framework')
    .argument('[id]', 'Project ID', 'tl-app')
    .action(actionWrapper(async (id) => {
        showBanner();
        const q = await inquirer.prompt([{ type: 'confirm', name: 'ok', message: chalk.cyan(`Scaffold ${id}?`), default: true }]);
        if (q.ok) {
            const spin = ora({ text: 'Generating workspace...', color: 'blue' }).start();
            setTimeout(() => {
                spin.succeed(chalk.green.bold('WORKSPACE READY 🚀'));
                console.log(chalk.gray('\n  Path: ') + chalk.white(`./${id}`));
            }, 2000);
        }
    }));

program.parse(process.argv);