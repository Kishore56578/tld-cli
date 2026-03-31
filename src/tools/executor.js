import fs from 'fs/promises';
import path from 'path';
import shell from 'shelljs';
import chalk from 'chalk';
import inquirer from 'inquirer';

/**
 * The unified TLD Coder secure native tool execution layer.
 * Any tool requested by the Next.js API endpoint is authorized and executed here.
 */

export async function executeTool(toolName, args, context) {
    try {
        switch (toolName) {
            case 'view_file':
                return await viewFile(args.path);
            
            case 'list_directory':
                return await listDirectory(args.path);
            
            case 'patch_file':
                return await patchFile(args.path, args.searchText, args.replacementText, context);
            
            case 'create_file':
                return await createFile(args.path, args.content, context);
            
            case 'read_tree':
                return await readTree(args.path || './');
            
            case 'run_command':
                return await runCommand(args.command, context);
            
            default:
                throw new Error(`Unknown tool requested: ${toolName}`);
        }
    } catch (error) {
        return `[Tool Execution Failed]: ${error.message}`;
    }
}

async function createFile(filePath, content, context) {
    const fullPath = path.resolve(process.cwd(), filePath);
    try {
        const dir = path.dirname(fullPath);
        await fs.mkdir(dir, { recursive: true });
        
        console.log(chalk.yellow(`\n  📝 The agent wishes to CREATE: `) + chalk.cyan(filePath));
        
        let shouldCreate = true;
        if (!context.flags?.yes) {
            const answer = await inquirer.prompt([{
                type: 'confirm',
                name: 'confirmCreate',
                message: 'Allow file creation?',
                default: true
            }]);
            shouldCreate = answer.confirmCreate;
        }

        if (shouldCreate) {
            await fs.writeFile(fullPath, content || '', 'utf-8');
            return `Successfully created ${filePath}.`;
        } else {
            return `User rejected the file creation of ${filePath}.`;
        }
    } catch (e) {
        throw new Error(`Creation failed: ${e.message}`);
    }
}

async function readTree(dirPath) {
    const fullPath = path.resolve(process.cwd(), dirPath);
    try {
        let output = `Tree Structure for: ${dirPath}\n`;
        async function scan(currentPath, indent = '') {
            const items = await fs.readdir(currentPath, { withFileTypes: true });
            for (const item of items) {
                if (item.name === 'node_modules' || item.name === '.git' || item.name === 'dist' || item.name === '.next') continue;
                output += `${indent}${item.isDirectory() ? '📂' : '📄'} ${item.name}\n`;
                if (item.isDirectory()) {
                    await scan(path.join(currentPath, item.name), indent + '  ');
                }
            }
        }
        await scan(fullPath);
        return output;
    } catch (e) {
        throw new Error(`Tree read failed: ${e.message}`);
    }
}

async function viewFile(filePath) {
    const fullPath = path.resolve(process.cwd(), filePath);
    try {
        const content = await fs.readFile(fullPath, 'utf-8');
        const lines = content.split('\n');
        if (lines.length > 500) {
            return `[File is too large (${lines.length} lines). Showing first 500 lines]\n${lines.slice(0, 500).join('\n')}`;
        }
        return content;
    } catch (e) {
        throw new Error(`Failed to read ${filePath}: ${e.message}`);
    }
}

async function listDirectory(dirPath) {
    const fullPath = path.resolve(process.cwd(), dirPath || '.');
    try {
        const items = await fs.readdir(fullPath, { withFileTypes: true });
        let output = `Directory: ${dirPath || '.'}\n`;
        items.forEach(item => {
            if (item.name === 'node_modules' || item.name === '.git') return;
            output += `  ${item.isDirectory() ? '📂' : '📄'} ${item.name}\n`;
        });
        return output;
    } catch (e) {
        throw new Error(`Failed to list ${dirPath}: ${e.message}`);
    }
}

async function patchFile(filePath, searchText, replacementText, context) {
    const fullPath = path.resolve(process.cwd(), filePath);
    try {
        const content = await fs.readFile(fullPath, 'utf-8');
        if (!content.includes(searchText)) {
            throw new Error('Search text not found in the target file. Check formatting.');
        }

        console.log(chalk.yellow(`\n  ⚠ The agent wishes to PATCH: `) + chalk.cyan(filePath));
        console.log(chalk.gray(`  - ${searchText.trim().substring(0, 50)}...`));
        console.log(chalk.green(`  + ${replacementText.trim().substring(0, 50)}...`));
        
        let shouldPatch = true;
        if (!context.flags?.yes) {
            const answer = await inquirer.prompt([{
                type: 'confirm',
                name: 'confirmPatch',
                message: 'Allow this code modification?',
                default: true
            }]);
            shouldPatch = answer.confirmPatch;
        }

        if (shouldPatch) {
            const newContent = content.replace(searchText, replacementText);
            await fs.writeFile(fullPath, newContent, 'utf-8');
            return `Successfully patched ${filePath}.`;
        } else {
            return `User rejected the patch operation for ${filePath}.`;
        }

    } catch (e) {
        throw new Error(`Patch failed: ${e.message}`);
    }
}

async function runCommand(command, context) {
    console.log(chalk.yellow(`\n  ⚡ The agent wishes to EXECUTE: `) + chalk.cyan(command));
    
    let shouldRun = true;
    if (!context.flags?.yes) {
         const answer = await inquirer.prompt([{
             type: 'confirm',
             name: 'confirmRun',
             message: 'Allow terminal execution?',
             default: false
         }]);
         shouldRun = answer.confirmRun;
    }

    if (shouldRun) {
        return new Promise((resolve) => {
            shell.exec(command, { silent: true }, (code, stdout, stderr) => {
                if (code !== 0) {
                    resolve(`Command failed with code ${code}\nSTDERR:\n${stderr}`);
                } else {
                    resolve(`Command succeeded.\nSTDOUT:\n${stdout.substring(0, 1000)}`); // Limit output buffer
                }
            });
        });
    } else {
        return `User rejected the command execution.`;
    }
}
