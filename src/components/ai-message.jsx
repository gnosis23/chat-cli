import React from 'react';
import {Box, Text} from 'ink';

export const AIMessage = ({message, isStreaming = false}) => {
	if (!message) return null;

	return (
		<Box flexDirection="column" marginBottom={1}>
			<Box>
				{isStreaming && (
					<Text color="gray" italic marginLeft={1}>
						🤖 AI: typing...
					</Text>
				)}
			</Box>
			<Box marginLeft={2}>
				<Text color="white">{message}</Text>
				{isStreaming && (
					<Text color="yellow" bold>
						█
					</Text>
				)}
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
