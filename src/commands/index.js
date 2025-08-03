import { configCommand } from './config-command.js';
import { toolsCommand } from './tools-command.js';
import { showMcpCommand } from './mcp-command.js';
import { initCommand } from './init-command.js';

const _commands = {
	'/init': {
		description: 'init project',
		func: initCommand,
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

function showHelp() {
	const keys = Object.keys(_commands);
	console.log('');
	console.log('Chat-CLI');
	console.log('');
	console.log('Interactive Mode Commands:');
	keys.forEach((key) => {
		console.log(`  ${key} - ${_commands[key].description}`);
	});
	console.log('\n');
}

export function getCommands() {
	return {..._commands};
}
