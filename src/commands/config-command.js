import { loadConfig, printConfig } from '../lib/config';

/**
 * Config command to load and print the configuration.
 */
export async function configCommand() {
	const config = await loadConfig();
	printConfig(config);
}
