import { useInput, useApp } from 'ink';
import { useState, useCallback } from 'react';
import { getCommands } from '../commands';
import { generateTextAuto } from '../lib/chat.js';
import { execute } from '../lib/tool-execution.js';
import { useMessage } from './use-message.js';

export const useAIChat = (config = {}) => {
	const { exit } = useApp();
	const { messages, onAddMessage, messagesRef } = useMessage();
	const [currentInput, setCurrentInput] = useState('');
	const [streamingMessage, setStreamingMessage] = useState(null);
	const [streamingTokenCount, setStreamingTokenCount] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);
	const [isComplete, setIsComplete] = useState(false);
	const [commands] = useState(() => getCommands());
	const [pendingToolCall, setPendingToolCall] = useState(null);
	const [autoAcceptMode, setAutoAcceptMode] = useState(false);

	const handleUserSelect = (tool) => {
		const shouldSelect = [
			'Bash',
			'WriteFile',
			'UpdateFile',
			'Weather',
		].includes(tool.toolName);

		if (autoAcceptMode || !shouldSelect) {
			// Auto-accept the tool call when auto accept mode is enabled
			handleToolAccept(tool);
		} else {
			setPendingToolCall(tool);
		}
	};

	const sendMessage = async () => {
		if (isLoading) return;

		setIsLoading(true);
		setError(null);
		setStreamingMessage('');
		setStreamingTokenCount(0);

		try {
			await generateTextAuto({
				config,
				messagesRef,
				onAddMessage,
				onChunk: (textPart, fullMessage, estimatedTokens) => {
					setStreamingTokenCount(estimatedTokens);
					setStreamingMessage(fullMessage); // Still store full message but won't display it
				},
				onSelect: handleUserSelect,
			});
		} catch (err) {
			setError(err.message);
			throw err;
		} finally {
			setIsLoading(false);
			setStreamingMessage(null);
			setStreamingTokenCount(0);
			setIsComplete(true);

			// Auto-exit in CLI mode after response is complete
			if (config.cliMode) {
				setTimeout(() => exit(), 100);
			}
		}
	};

	const cancelMessage = useCallback(() => {
		setIsLoading(false);
		setStreamingMessage(null);
		setStreamingTokenCount(0);
		setError('Message cancelled by user');
	}, []);

	const handleToolAccept = async (toolCall) => {
		const _pendingToolCall = toolCall || pendingToolCall;
		if (!_pendingToolCall) return;

		setPendingToolCall(null);

		try {
			const message = await execute(_pendingToolCall, {
				config,
				onAddMessage,
			});
			onAddMessage(message);

			// Continue the conversation
			await sendMessage();
		} catch (err) {
			setError(`Tool execution failed: ${err.message}`);
		}
	};

	const handleToolAcceptAuto = async (toolCall) => {
		const _pendingToolCall = toolCall || pendingToolCall;
		if (!_pendingToolCall) return;

		setPendingToolCall(null);
		setAutoAcceptMode(true);

		try {
			const message = await execute(_pendingToolCall, {
				config,
				onAddMessage,
			});
			onAddMessage(message);

			// Continue the conversation
			await sendMessage();
		} catch (err) {
			setError(`Tool execution failed: ${err.message}`);
		}
	};

	const handleToolDecline = () => {
		if (!pendingToolCall) return;

		// Add declined message
		const declinedMessage = {
			role: 'assistant',
			content: `Tool call ${pendingToolCall.toolName} was declined by user.`,
		};

		// Continue the conversation without the tool
		onAddMessage(declinedMessage);

		setPendingToolCall(null);
	};

	const handleSubmit = async (inputText) => {
		if (inputText.trim()) {
			const words = inputText.trim().split(/\s+/);
			if (words[0] && commands[words[0]]) {
				const func = commands[words[0]].func;
				const args = words.slice(1).join(' ');
				setCurrentInput('');
				setIsLoading(true);
				try {
					const commandResult = await func({
						config,
						messagesRef,
						onAddMessage,
						onChunk: (textPart, fullMessage, estimatedTokens) => {
							setStreamingTokenCount(estimatedTokens);
							setStreamingMessage(fullMessage); // Still store full message but won't display it
						},
						args,
						onSelect: handleUserSelect,
					});

					if (commandResult) onAddMessage(commandResult);
				} catch (err) {
					console.error(err);
				} finally {
					setStreamingMessage(null);
					setStreamingTokenCount(0);
					setIsLoading(false);
				}
				return;
			}

			const userMessage = { role: 'user', content: inputText.trim() };
			onAddMessage(userMessage);
			setCurrentInput('');

			sendMessage();
		}
	};

	useInput((input, key) => {
		// Block input when tool selection is active
		if (pendingToolCall) {
			return;
		}

		// Toggle auto accept mode with shift+tab
		if (key.shift && key.tab) {
			setAutoAcceptMode((prev) => !prev);
			return;
		}

		if (key.ctrl && input === 'c') {
			if (isLoading) {
				cancelMessage();
			} else {
				exit();
			}
			return;
		}
	});

	const isToolSelectionActive = !!pendingToolCall;

	return {
		messages,
		currentInput,
		setCurrentInput,
		handleSubmit,
		streamingMessage,
		streamingTokenCount,
		isLoading,
		error,
		isComplete,
		pendingToolCall,
		isToolSelectionActive,
		handleToolAccept,
		handleToolAcceptAuto,
		handleToolDecline,
		autoAcceptMode,
		setAutoAcceptMode,
	};
};
