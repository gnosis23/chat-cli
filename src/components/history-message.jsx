import React from 'react';
import { Box, Text } from 'ink';
import dedent from 'dedent';
import { marked } from 'marked';
import { markedTerminal } from 'marked-terminal';

import { GAP_SIZE } from '../constant.js';

marked.use(markedTerminal({}));

const colors = {
	user: 'blue',
	bot: 'gray',
	system: 'yellow',
	tool: '#0098df',
};

const prefixes = {
	user: '>',
	bot: '⏺',
	system: '*',
	tool: '#',
};

export const HistoryMessage = ({ message, index }) => {
	if (message.type === 'tool') {
		return (
			<Box key={index} display="flex" marginBottom={1}>
				<Text color="cyan">{prefixes[message.type]}</Text>
				<Box
					flexDirection="column"
					paddingLeft={GAP_SIZE}
					paddingRight={GAP_SIZE}
				>
					<Text color={colors.tool}>call tool [{message.toolName}]:</Text>
					<Text color="gray">{message.text}</Text>
				</Box>
			</Box>
		);
	}

	const text =
		message.type === 'bot'
			? marked(dedent(message.text)).trim()
			: dedent(message.text).trim();

	return (
		<Box key={index} display="flex" marginBottom={1}>
			<Text>{prefixes[message.type]}</Text>
			<Box
				flexDirection="column"
				paddingLeft={GAP_SIZE}
				paddingRight={GAP_SIZE}
			>
				<Text color={colors[message.type]}>{text}</Text>
			</Box>
		</Box>
	);
};
