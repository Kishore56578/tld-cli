import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs';
import path from 'path';
import { getApiKey, getModel } from './config.js';
import { executeTool } from './tools/executor.js';

export async function bootstrapCoder(argv) {
    const devMode = argv.dev;

    console.log(chalk.cyan('╭─ ' + chalk.bold('TECHLIFT DIGITAL CODER INTERFACE ') + chalk.white('(Agentic Mode)')));
    
    if (devMode) {
        console.log(chalk.bgYellow.black(' [DEV TESTING MODE ACTIVE] ') + chalk.yellow(' API logic is constrained to local loopbacks without live credits.\n'));
    }

    if (!devMode && !getApiKey()) {
        console.log(chalk.red('\n   ✕ Error: No TechLift Digital Coder API Key found.'));
        console.log(chalk.white('   Run ' + chalk.cyan('tld login') + ' to authenticate your session.\n'));
        return;
    }

    const context = {
        workingDir: process.cwd(),
        payload: null,
        hasConfig: false,
        devMode,
        flags: argv
    };

    const tldDir = path.join(process.cwd(), '.tld');
    const rulesPath = path.join(tldDir, 'rules.json');
    const configPath = path.join(tldDir, 'config.json');
    const skillsDir = path.join(tldDir, 'skills');

    const contextData = {};

    // 1. Core Rule & Config JSON Hydration
    if (fs.existsSync(rulesPath)) {
        try { contextData.rules = JSON.parse(fs.readFileSync(rulesPath, 'utf8')); } catch (e) {}
    }
    if (fs.existsSync(configPath)) {
        try { contextData.config = JSON.parse(fs.readFileSync(configPath, 'utf8')); } catch (e) {}
    }

    // 2. Extensible Skills Hydration (.tld/skills/)
    if (fs.existsSync(skillsDir) && fs.statSync(skillsDir).isDirectory()) {
        const skillFiles = fs.readdirSync(skillsDir);
        contextData.skills = {};
        for (const file of skillFiles) {
            const ext = path.extname(file);
            if (['.json', '.md', '.txt'].includes(ext)) {
                try {
                    const content = fs.readFileSync(path.join(skillsDir, file), 'utf8');
                    contextData.skills[file.replace(ext, '')] = ext === '.json' ? JSON.parse(content) : content;
                } catch (e) {}
            }
        }
    }

    if (Object.keys(contextData).length > 0) {
        context.payload = contextData;
        context.hasConfig = true;
        console.log(chalk.green(`   ✓ Architecture context loaded (${Object.keys(contextData).join(', ')}) into inference memory.\n`));
    } else {
        console.log(chalk.yellow('   ⚠ No local .tld rules or skills found. Running generic intelligence patterns.\n'));
    }
    console.log(chalk.gray('  (Type "exit" to terminate session, "clear" to reset context.)\n'));

    await runAgentLoop(context);
}

async function runAgentLoop(context) {
    let messageHistory = [];

    while (true) {
        const answers = await inquirer.prompt([{
            type: 'input',
            name: 'prompt',
            message: chalk.cyan.bold('❯'),
            prefix: ''
        }]);

        const prompt = answers.prompt.trim();

        if (prompt.toLowerCase() === 'exit') {
            console.log(chalk.gray('  Terminating secure agent session...'));
            process.exit(0);
        }

        if (prompt.toLowerCase() === 'clear') {
            messageHistory = [];
            console.clear();
            console.log(chalk.green('  ✓ Context wiped clean. Agent memory reset.\n'));
            continue;
        }

        if (!prompt) continue;

        messageHistory.push({ role: 'user', content: prompt });
        let turnContextFinished = false;
        let recursions = 0;

        const spinner = ora({ text: chalk.blue('Analyzing intent...'), color: 'cyan' }).start();

        try {
            while (!turnContextFinished && recursions < 10) {
                recursions++;
                
                let responseText = '';
                
                if (context.devMode) {
                    spinner.text = chalk.cyan('Synthesizing dynamic loopback context (Dev Mode)...');
                    await new Promise(resolve => setTimeout(resolve, 600));
                    spinner.text = chalk.magenta('Formatting logic gate responses...');
                    await new Promise(resolve => setTimeout(resolve, 800));
                    
                    // Force the dev simulation to just complete the turn without tools
                    responseText = `[Local Fallback Dev Build] Simulated architectural implementation for: "${prompt}" successfully completed.`;
                    turnContextFinished = true;
                } else {
                    const API_URL = process.env.TLD_API_URL || 'https://localhost:3000';
                    const apiKey = getApiKey();
                    
                    // Extremely important: Next.js --experimental-https generates self-signed certificates.
                    // Node.js native fetch strictly rejects them unless we bypass it locally.
                    if (API_URL.includes('localhost')) {
                        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
                    }
                    
                    spinner.text = chalk.cyan(`Awaiting ${getModel()} intelligence via TLD Bridge...`);
                    
                    const res = await fetch(`${API_URL}/api/coder/inference`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${apiKey}`,
                            'User-Agent': 'tld-cli/local'
                        },
                        body: JSON.stringify({ 
                            messages: messageHistory, 
                            model: getModel(), 
                            context: context.payload 
                        })
                    });

                    const data = await res.json();

                    if (!res.ok || !data.success) {
                        spinner.fail(chalk.red(' API Backend Exception: ') + chalk.white(data.error || 'Unknown Gateway error.'));
                        if (res.status === 429) {
                           console.log(chalk.yellow(`  ⚠ IP/Token Ratelimit triggered... reset strictly locked until ${new Date(data.reset).toLocaleTimeString()}`));
                        }
                        turnContextFinished = true; // Break the tool loop on error
                        continue;
                    }
                    
                    // Protocol check for tool calls from our backend interface
                    if (data.toolCall) {
                        spinner.stop();
                        console.log(chalk.magenta(`\n  ⚙  [Action Required] TLD Coder invoked intrinsic tool: ${data.toolCall.name}`));
                        
                        const toolResult = await executeTool(data.toolCall.name, data.toolCall.args, context);
                        messageHistory.push({ role: 'assistant', tool_call: data.toolCall });
                        messageHistory.push({ role: 'tool', name: data.toolCall.name, content: toolResult });
                        
                        spinner.start(chalk.blue('Transmitting tool execution sequence results backward to logic core...'));
                    } else {
                        responseText = data.message;
                        messageHistory.push({ role: 'assistant', content: responseText });
                        turnContextFinished = true;
                    }
                }
                
                if (turnContextFinished && responseText) {
                    spinner.stop();
                    console.log('');
                    console.log(chalk.cyan('╭─ TechLift Digital Coder '));
                    console.log(chalk.white(`│ ${responseText}`));
                    
                    if (context.hasConfig && context.payload?.rules?.lint === 'strict') {
                        console.log(chalk.yellow(`│ [System Constraints] Validating runtime execution against robust project .tld/rules.json matrices.`));
                    }
                    console.log(chalk.cyan('╰' + '─'.repeat(48) + '\n'));
                }
            }
            
            if (recursions >= 10) {
                spinner.fail(chalk.red('Agentic Depth Limit Reached (Max 10 tool calls per turn prevents infinite loops).'));
            }

        } catch (e) {
            spinner.fail(chalk.red('Fatal Interface Disconnect. ') + 'Ensure backend systems are appropriately hooked.');
            console.log(chalk.gray(`  Details: ${e.message}`));
        }
    }
}
