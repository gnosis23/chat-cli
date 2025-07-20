import React from 'react';
import {Box, Text} from 'ink';

export const AIMessage = ({message, isStreaming = false, tokenCount = 0}) => {
	if (!message) return null;

	return (
		<Box flexDirection="column" marginBottom={1}>
			<Box gap={2}>
				{isStreaming && (
					<>
						<Text color="gray">⏺</Text>
						<Text color="gray" italic marginLeft={1}>
							typing...
						</Text>
						<Text color="gray" italic marginLeft={1}>
							({tokenCount} tokens)
						</Text>
					</>
				)}
			</Box>
			<Box marginLeft={2}>
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
