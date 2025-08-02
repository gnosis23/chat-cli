import React from 'react';
import { Box, Text } from 'ink';
import dedent from 'dedent';
import marked from '../lib/marked.js';

export const CliMessage = ({ message }) => {
	if (message.role !== 'assistant') return null;

	const text =
		typeof message.content === 'string'
			? marked(dedent(message.content)).trim()
			: typeof message.content === 'string'
				? marked(dedent(message.content)).trim()
				: null;

	return (
		<Box>
			<Text>{text}</Text>
		</Box>
	);
};
