import fs from 'fs';
import path from 'path';
import os from 'os';
import chalk from 'chalk';
import { configCommand } from './config-command.js';
import { toolsCommand } from './tools-command.js';
import { showMcpCommand } from './mcp-command.js';
import { initCommand } from './init-command.js';
import { clearCommand } from './clear-command.js';

const builtinCommands = {
	'/init': {
		description: 'init project',
		func: initCommand,
	},
	'/clear': {
		description: 'clear session',
		func: clearCommand,
	},
	'/config': {
		description: 'show config',
		func: configCommand,
	},
	'/tools': {
		description: 'list built-in tools',
		func: toolsCommand,
	},
	'/help': {
		description: 'show help',
		func: showHelp,
	},
	'/mcp': {
		description: 'Manage MCP servers',
		func: showMcpCommand,
	},
};

const externalCommands = {};

function showHelp() {
	const allCommands = { ...builtinCommands, ...externalCommands };
	const keys = Object.keys(allCommands);
	console.log('');
	console.log('Chat-CLI');
	console.log('');
	console.log('Interactive Mode Commands:');
	keys.forEach((key) => {
		console.log(`  ${key} - ${allCommands[key].description}`);
	});
	console.log('\n');
}

function createCustomFunc(fileContent, commandName) {
	return async function ({ args }) {
		if (typeof fileContent !== 'string') return;

		// Replace template variables
		let prompt = fileContent;
		if (args) {
			prompt = prompt.replaceAll('$ARGUMENTS', args);
		}

		// Add context about the command being executed
		const fullPrompt = `${prompt}`;

		return { role: 'user', content: fullPrompt };
	};
}

export async function loadExternalCommands({
	quiet,
	logMessages,
	customDirs = [],
}) {
	try {
		// Default commands directory
		const defaultCommandsDir = path.join(os.homedir(), '.chat-cli', 'commands');
		const commandDirs = [defaultCommandsDir, ...customDirs];

		// Create default directory if it doesn't exist
		if (!fs.existsSync(defaultCommandsDir)) {
			fs.mkdirSync(defaultCommandsDir, { recursive: true });
		}

		let loadedCount = 0;

		// Load commands from all directories
		for (const commandsDir of commandDirs) {
			if (!fs.existsSync(commandsDir)) {
				continue;
			}

			// Read all .md files in the commands directory
			const files = fs.readdirSync(commandsDir);
			const mdFiles = files.filter((file) => file.endsWith('.md'));

			for (const file of mdFiles) {
				const filePath = path.join(commandsDir, file);
				const commandName = '/' + path.basename(file, '.md');

				// Skip if command already exists (first loaded wins)
				if (externalCommands[commandName]) {
					continue;
				}

				try {
					const fileContent = fs.readFileSync(filePath, 'utf8');

					// Generate description from first line of file or use filename
					const firstLine = fileContent
						.split('\n')[0]
						.replace(/^#\s*/, '')
						.trim();
					const description = firstLine || `Custom command: ${commandName}`;

					// Store the command
					externalCommands[commandName] = {
						description,
						func: createCustomFunc(fileContent, commandName),
					};

					loadedCount++;
					if (!quiet)
						logMessages.push(
							chalk.dim(
								`  Loaded external command: ${commandName} (${commandsDir})`
							)
						);
				} catch (error) {
					if (!quiet)
						logMessages.push(
							`  Error loading external command ${commandName} from ${commandsDir}:`,
							error.message
						);
				}
			}
		}
	} catch (error) {
		if (!quiet)
			logMessages.push('Error loading external commands:', error.message);
	}
}

export function getCommands() {
	return { ...externalCommands, ...builtinCommands };
}
