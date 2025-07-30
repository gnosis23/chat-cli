import { toolsObject } from '../tools';

/**
 * Tools command: list tools
 */
export async function toolsCommand() {
	const keys = Object.keys(toolsObject);
	console.log('--------------------------------------');
	console.log('Tools:');
	keys.forEach((key) => {
		console.log(`- ${key}`);
	});
	console.log('--------------------------------------\n');
}
