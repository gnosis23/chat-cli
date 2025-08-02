import React from 'react';
import { Box, Text } from 'ink';
import dedent from 'dedent';

import marked from '../lib/marked.js';
import { GAP_SIZE } from '../constant.js';

const colors = {
	user: 'blue',
	assistant: 'gray',
	system: 'yellow',
	tool: '#0098df',
	error: 'red',
};

const prefixes = {
	user: '>',
	assistant: '⏺',
	system: '*',
	tool: '#',
	error: 'x',
};

export const HistoryMessage = ({ message, index }) => {
	if (message.role === 'system') {
		return null;
	}

	if (message.role === 'tool') {
		return message.content.map((tool, idx) => (
			<Box key={`tool-${idx}`} display="flex" marginBottom={1}>
				<Text color="cyan">{prefixes.tool}</Text>
				<Box
					flexDirection="column"
					paddingLeft={GAP_SIZE}
					paddingRight={GAP_SIZE}
				>
					<Box>
						<Text color={colors.tool} bold>
							{tool.toolName}
						</Text>
						<Text>({tool.title})</Text>
					</Box>
					<Text color="gray">{tool.text}</Text>
				</Box>
			</Box>
		));
	}

	if (message.role === 'assistant' && typeof message.content !== 'string') {
		// ignore tool
		return null;
	}

	const text =
		message.role === 'assistant' && typeof message.content === 'string'
			? marked(dedent(message.content)).trim()
			: typeof message.content === 'string'
				? dedent(message.content).trim()
				: null;

	return (
		<Box key={index} display="flex" marginBottom={1}>
			<Text>{prefixes[message.role]}</Text>
			<Box
				flexDirection="column"
				paddingLeft={GAP_SIZE}
				paddingRight={GAP_SIZE}
			>
				<Text color={colors[message.role]}>{text}</Text>
			</Box>
		</Box>
	);
};
