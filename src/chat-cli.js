import React from 'react';
import { render } from 'ink';
import meow from 'meow';
import { loadConfig, printConfig } from './lib/config.js';
import { initMcp } from './mcp.js';
import App from './app.jsx';

const cli = meow(
	`
		Usage
		  $ chat-cli

		Options
		  --model        AI model to use (default: deepseek-chat)
		  --temperature  Response temperature (default: 0.7)
		  --max-tokens   Maximum tokens in response (default: 1000)
		  --api-key      DeepSeek API key
	`,
	{
		importMeta: import.meta,
		flags: {
			model: {
				type: 'string',
			},
			temperature: {
				type: 'number',
			},
			apiKey: {
				type: 'string',
			},
		},
	}
);

function printWelcome() {
	console.log('');
	console.log('  Chat CLI - 0.1.0');
	console.log('');
}

async function main() {
	printWelcome();
	const config = await loadConfig();
	if (process.env.DEBUG === '1') {
		printConfig(config);
	}

	await initMcp(config);

	render(React.createElement(App, { config: { ...config, ...cli.flags } }));
}

main();
