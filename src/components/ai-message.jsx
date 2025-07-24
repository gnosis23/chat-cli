import React from 'react';
import { Box, Text } from 'ink';
import { GAP_SIZE, PRIMARY_COLOR } from '../constant.js';

// 动词数组，随机展示
const typingVerbs = [
	'Typing',
	'Thinking',
	'Processing',
	'Analyzing',
	'Computing',
	'Generating',
	'Crafting',
	'Composing',
	'Writing',
	'Formulating',
	'Calculating',
	'Deliberating',
	'Reasoning',
	'Synthesizing',
	'Constructing',
];

export const AIMessage = ({ message, isStreaming = false, tokenCount = 0 }) => {
	if (!message) return null;

	// 基于 tokenCount 选择动词，确保在同一次流式输出中保持一致
	const verbIndex = Math.floor(tokenCount / 100) % typingVerbs.length;
	const currentVerb = typingVerbs[verbIndex];

	return (
		<Box flexDirection="column" marginBottom={1}>
			<Box gap={GAP_SIZE}>
				{isStreaming && (
					<>
						<Text color="gray">⏺</Text>
						<Text color={PRIMARY_COLOR} italic marginLeft={1}>
							{currentVerb}
							{tokenCount % 4 < 1 ? ' ' : '.'}
							{tokenCount % 4 < 2 ? ' ' : '.'}
							{tokenCount % 4 < 3 ? ' ' : '.'}
						</Text>
						<Text color="gray" italic marginLeft={1}>
							({tokenCount} tokens)
						</Text>
					</>
				)}
			</Box>
			<Box marginLeft={GAP_SIZE}>
				{!isStreaming && <Text color="white">{message}</Text>}
			</Box>
		</Box>
	);
};

export const LoadingIndicator = () => (
	<Box>
		<Text color="yellow" italic>
			Thinking...
		</Text>
	</Box>
);

export const ErrorMessage = ({ error }) => (
	<Box>
		<Text color="red" bold>
			❌ Error: {error}
		</Text>
	</Box>
);
