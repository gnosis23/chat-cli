import React, { useEffect } from 'react';
import { Box, Text, Static } from 'ink';
import Spinner from 'ink-spinner';
import { GAP_SIZE } from './constant.js';
import { useAIChat } from './hooks/use-ai-chat.js';
import { AIMessage, ErrorMessage } from './components/ai-message.jsx';
import { HistoryMessage } from './components/history-message.jsx';
import { CliMessage } from './components/cli-message.jsx';
import TextInput from './components/text-input.jsx';
import ToolSelection from './components/tool-selection.jsx';

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
		pendingToolCall,
		isToolSelectionActive,
		handleToolAccept,
		handleToolAcceptAuto,
		handleToolDecline,
		autoAcceptMode,
	} = useAIChat(config);

	// CLI mode: auto-submit initial prompt
	useEffect(() => {
		if (
			config.cliMode &&
			config.initialPrompt &&
			!messages.some((m) => m.role === 'user')
		) {
			handleSubmit(config.initialPrompt);
		}
	}, [config.cliMode, config.initialPrompt, handleSubmit, messages]);

	// CLI mode: don't show input box
	if (config.cliMode) {
		return (
			<Box flexDirection="column">
				<Box>
					<Static items={messages}>
						{(item, index) => (
							<CliMessage key={index} message={item} index={index} cliMode />
						)}
					</Static>
				</Box>
			</Box>
		);
	}

	return (
		<Box flexDirection="column" gap={0}>
			{/* Message history */}
			<Box marginBottom={1} minWidth={120}>
				<Static items={messages}>
					{(item, index) => (
						<HistoryMessage
							key={`${item.role}-${index}`}
							message={item}
							index={index}
						/>
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

			{/* Tool Selection */}
			{isToolSelectionActive && pendingToolCall && (
				<ToolSelection
					toolCall={pendingToolCall}
					onAccept={handleToolAccept}
					onAcceptAuto={handleToolAcceptAuto}
					onDecline={handleToolDecline}
				/>
			)}

			{/* Input box - hidden when tool selection is active */}
			{!isToolSelectionActive && (
				<TextInput
					value={currentInput}
					onChange={setCurrentInput}
					onSubmit={handleSubmit}
					prefix="> "
					isLoading={isLoading}
					autoAcceptMode={autoAcceptMode}
				/>
			)}
		</Box>
	);
}
