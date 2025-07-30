import { configCommand } from './config-command.js';
import { toolsCommand } from './tools-command.js';

function showCommand() {
	const keys = Object.keys(commands);
	console.log('--------------------------------------');
	console.log('Commands:');
	keys.forEach((key) => {
		console.log(`- ${key}`);
	});
	console.log('--------------------------------------\n');
}

export const commands = {
	'/config': configCommand,
	'/tools': toolsCommand,
	'/commands': showCommand,
};
