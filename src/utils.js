import chalk from 'chalk';
import figlet from 'figlet';
import gradient from 'gradient-string';
import { spawn } from 'child_process';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pkg = require('../package.json');

export const execAsyncWithProgress = (cmd, spin, baseText) => {
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

export function showBanner() {
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

export const actionWrapper = (fn) => async (...args) => {
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
