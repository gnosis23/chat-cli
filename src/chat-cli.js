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
		  $ chat-cli -p "your prompt here"

		Options
		  --model        AI model to use (default: deepseek-chat)
		  --temperature  Response temperature (default: 0.7)
		  --max-tokens   Maximum tokens in response (default: 1000)
		  --api-key      DeepSeek API key
		  -p, --prompt   CLI mode: send prompt directly and exit
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
			prompt: {
				type: 'string',
				alias: 'p',
			},
		},
	}
);

function printWelcome() {
	console.log('');
	console.log('  Chat CLI - 0.2.0');
	console.log('');
}

async function main() {
	const config = await loadConfig();

	// CLI mode - skip welcome message and direct prompt
	if (cli.flags.prompt) {
		if (process.env.DEBUG === '1') {
			printConfig(config);
		}

		await initMcp(config);

		render(
			React.createElement(App, {
				config: {
					...config,
					...cli.flags,
					cliMode: true,
					initialPrompt: cli.flags.prompt,
				},
			})
		);
		return;
	}

	// Normal interactive mode
	printWelcome();
	if (process.env.DEBUG === '1') {
		printConfig(config);
	}

	await initMcp(config);

	render(React.createElement(App, { config: { ...config, ...cli.flags } }));
}

main();
