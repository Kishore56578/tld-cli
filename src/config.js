import Conf from 'conf';
import chalk from 'chalk';

const config = new Conf({ projectName: 'tld-cli' });

export function setApiKey(key) {
    config.set('apiKey', key);
    console.log(chalk.green('✔ API Key stored securely in local configuration.'));
}

export function getApiKey() {
    return config.get('apiKey');
}

export function setModel(model) {
    config.set('model', model);
    console.log(chalk.green(`✔ Preferred model updated: ${model}`));
}

export function getModel() {
    return config.get('model', 'tld-ai-mini'); // default model
}

export function handleLogin() {
    console.log(chalk.cyan.bold('\n  🔒 TechLift Digital ─ Authentication'));
    console.log(chalk.gray('  ' + '─'.repeat(50)));
    console.log(chalk.white('   To unlock the ' + chalk.cyan('TechLift Digital Coder') + ' autonomous agent, you need to authenticate.'));
    console.log(chalk.white('   1. Navigate to: ') + chalk.cyan.underline('https://techliftdigital.in/settings/api-keys'));
    console.log(chalk.white('   2. Generate a new API Key for your workspace.'));
    console.log(chalk.white('   3. Run the following command in your terminal:\n'));
    console.log(chalk.blue.bold('      $ tld config set-key <your-api-key>\n'));
}

export function handleConfig(action, value) {
    if (action === 'set-key' && value) {
        setApiKey(value);
    } else if (action === 'set-model' && value) {
        setModel(value);
    } else {
        console.log(chalk.red('\n  ✘ Invalid config action.'));
        console.log(chalk.white('  Usage: ') + chalk.cyan('tld config <set-key|set-model> <value>\n'));
    }
}
