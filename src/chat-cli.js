import React from 'react';
import { render } from 'ink';
import meow from 'meow';
import { loadConfig, printConfig } from './lib/config.js';
import App from './app.jsx';

const defaultConfig = {
	model: 'deepseek/deepseek-chat-v3-0324',
	temperature: 0.7,
	maxTokens: 1000,
};

const cli = meow(
	`
		Usage
		  $ ink-app

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
				default: defaultConfig.model,
			},
			temperature: {
				type: 'number',
				default: defaultConfig.temperature,
			},
			maxTokens: {
				type: 'number',
				default: defaultConfig.maxTokens,
			},
			apiKey: {
				type: 'string',
			},
		},
	}
);

function printWelcome() {
	console.log('  Chat CLI - 0.1.0  	\n');
}

async function main() {
	printWelcome();
	const config = await loadConfig();
	if (process.env.DEBUG === '1') {
		printConfig(config);
	}
	render(React.createElement(App, { config: { ...config, ...cli.flags } }));
}

main();
