import React from 'react';
import { render } from 'ink';
import meow from 'meow';
import App from './app.jsx';

console.log('\n');

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
				default: 'deepseek/deepseek-chat-v3-0324',
			},
			temperature: {
				type: 'number',
				default: 0.7,
			},
			maxTokens: {
				type: 'number',
				default: 1000,
			},
			apiKey: {
				type: 'string',
			},
		},
	}
);

render(React.createElement(App, { config: cli.flags }));
