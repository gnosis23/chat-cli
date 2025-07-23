import React from 'react';
import { Box, Text, Static } from 'ink';
import Spinner from 'ink-spinner';
import { GAP_SIZE } from './constant.js';
import { useAIChat } from './hooks/use-ai-chat.js';
import { AIMessage, ErrorMessage } from './components/ai-message.jsx';
import { HistoryMessage } from './components/history-message.jsx';
import TextInput from './components/text-input.jsx';

export default function ChatApp({ config = {} }) {
	const {
		messages,
		currentInput,
		setCurrentInput,
		handleSubmit,
		streamingMessage,
		streamingTokenCount,
		isLoading,
		error,
	} = useAIChat(config);

	return (
		<Box flexDirection="column" gap={0}>
			{/* Message history */}
			<Box marginBottom={1} minWidth={120}>
				<Static items={messages}>
					{(item, index) => (
						<HistoryMessage key={index} message={item} index={index} />
					)}
				</Static>
				{streamingMessage && (
					<AIMessage
						message={streamingMessage}
						isStreaming={true}
						tokenCount={streamingTokenCount}
					/>
				)}
				{isLoading && !streamingMessage && (
					<Box gap={GAP_SIZE} marginBottom={1}>
						<Text color="white">
							<Spinner type="dots" />
						</Text>
						<Text color="white">Thinking...</Text>
					</Box>
				)}
				{error && <ErrorMessage error={error} />}
			</Box>

			{/* Input box */}
			<TextInput
				value={currentInput}
				onChange={setCurrentInput}
				onSubmit={handleSubmit}
				prefix="> "
			/>

			{/* Help text */}
			<Box marginBottom={1}>
				<Text color="white" dimColor>
					{isLoading
						? 'Press Ctrl+C to cancel'
						: 'Press Enter to send | Press Ctrl+C to exit | Arrow keys to navigate'}
				</Text>
			</Box>
		</Box>
	);
}
