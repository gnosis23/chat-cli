import React from 'react';
import {Box, Text} from 'ink';
import {GAP_SIZE, PRIMARY_COLOR} from '../constant.js';

export const AIMessage = ({message, isStreaming = false, tokenCount = 0}) => {
	if (!message) return null;

	return (
		<Box flexDirection="column" marginBottom={1}>
			<Box gap={GAP_SIZE}>
				{isStreaming && (
					<>
						<Text color="gray">⏺</Text>
						<Text color={PRIMARY_COLOR} italic marginLeft={1}>
							typing
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

export const ErrorMessage = ({error}) => (
	<Box>
		<Text color="red" bold>
			❌ Error: {error}
		</Text>
	</Box>
);
