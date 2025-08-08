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
	secondary: '#ccc',
};

const prefixes = {
	user: '>',
	assistant: '⏺',
	system: '*',
	tool: '#',
	error: 'x',
	info: '$',
};

export const HistoryMessage = ({ message, index }) => {
	if (message.role === 'system') {
		return null;
	}

	if (message.role === 'gui') {
		return (
			<Box marginBottom={1}>
				<Text color="gray">{prefixes.info}</Text>
				{Array.isArray(message.content) ? (
					message.content.map((msg, idx) => (
						<Box
							key={`gui-${idx}`}
							flexDirection="column"
							paddingLeft={GAP_SIZE}
						>
							<Box gap={1}>
								<Text color={colors.secondary} bold>
									{msg.type}:
								</Text>
								{msg.type === 'usage' ? (
									<Text color={colors.secondary}>
										promptTokens-{msg.usage?.promptTokens} completionTokens-
										{msg.usage?.completionTokens}
									</Text>
								) : (
									<Text color={colors.secondary}>{msg.text}</Text>
								)}
							</Box>
						</Box>
					))
				) : (
					<Box key={`gui-0`} flexDirection="column" paddingLeft={GAP_SIZE}>
						<Box gap={1}>
							<Text color={colors.secondary}>{message.content}</Text>
						</Box>
					</Box>
				)}
			</Box>
		);
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
		<Box display="flex" marginBottom={1}>
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
