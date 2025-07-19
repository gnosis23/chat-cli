#!/usr/bin/env node
import React from 'react';
import {render} from 'ink';
import meow from 'meow';
import App from './app.js';

const cli = meow(
	`
		Usage
		  $ ink-app

		Options
		  --model        AI model to use (default: deepseek-chat)
		  --temperature  Response temperature (default: 0.7)
		  --max-tokens   Maximum tokens in response (default: 1000)
		  --api-key      DeepSeek API key
		  --base-url     Custom API base URL
	`,
	{
		importMeta: import.meta,
		flags: {
			model: {
				type: 'string',
				default: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
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
			baseUrl: {
				type: 'string',
			},
		},
	},
);

render(<App config={cli.flags} />);
