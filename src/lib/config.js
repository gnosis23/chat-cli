import fs from 'fs/promises';
import { z } from 'zod';
import { defaultConfig } from '../constant.js';

const configSchema = z.object({
	model: z.string().min(1, 'Model must be a non-empty string'),
	temperature: z.number().min(0).max(2, 'Temperature must be between 0 and 2'),
	maxStep: z
		.number()
		.int()
		.positive('Max step must be a positive integer')
		.optional(),
	mcpServers: z
		.record(
			z.object({
				command: z.string().optional(),
				args: z.array(z.string()).optional(),
				env: z.record(z.string()).optional(),
				disabled: z.boolean().optional(),
				autoApprove: z.array(z.string()).optional(),
			})
		)
		.optional()
		.default({}),
});

export async function loadConfig() {
	// read ~/.chat-cli.json
	const configPath = `${process.env.HOME}/.chat-cli.json`;
	const exist = await fs
		.access(configPath)
		.then(() => true)
		.catch(() => false);

	if (exist) {
		const configFile = await fs.readFile(configPath, 'utf-8');
		try {
			const settings = JSON.parse(configFile);

			// Validate with Zod
			const validatedConfig = configSchema.parse({
				...settings,
			});

			return validatedConfig;
		} catch (error) {
			// If validation fails, log error and use default
			if (error instanceof z.ZodError) {
				console.warn('Configuration validation failed', error.errors);
				throw new Error('Configuration validation failed');
			} else {
				console.warn('Invalid JSON in config file, using defaults');
			}
		}
	}

	// Create new config file with defaults
	await fs.writeFile(configPath, JSON.stringify(defaultConfig, null, 2));

	return configSchema.parse(defaultConfig);
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
