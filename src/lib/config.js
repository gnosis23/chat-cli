import fs from 'fs/promises';
import { defaultConfig } from '../constant.js';

export async function loadConfig() {
	// read ~/.chat-cli.json
	const configPath = `${process.env.HOME}/.chat-cli.json`;
	const exist = await fs
		.access(configPath)
		.then(() => true)
		.catch(() => false);
	if (exist) {
		const configFile = await fs.readFile(configPath, 'utf-8');
		return JSON.parse(configFile);
	} else {
		await fs.writeFile(configPath, JSON.stringify(defaultConfig, null, 2));
	}
	return defaultConfig;
}

export function printConfig(config) {
	console.log('--------------------------------------');
	console.log('Using configuration:');
	console.log(`- Model: ${config.model}`);
	console.log(`- Temperature: ${config.temperature}`);
	if (config.apiKey || process.env.OPENROUTER_API_KEY) {
		console.log('- API Key: Provided');
	} else {
		console.log('- API Key: Not provided');
	}
	console.log('--------------------------------------\n');
}
