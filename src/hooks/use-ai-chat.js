import { useInput, useApp } from 'ink';
import { useState, useCallback } from 'react';
import { toolsExecute } from '../tools/index.js';
import { getCommands } from '../commands';
import { getSystemPrompt } from '../lib/prompt.js';
import { generateTextAuto } from '../lib/chat.js';

export const useAIChat = (config = {}) => {
	const { exit } = useApp();
	const [messages, setMessages] = useState(() => {
		return [
			{
				role: 'system',
				content: getSystemPrompt({ custom: true }),
			},
		];
	});
	const [currentInput, setCurrentInput] = useState('');
	const [streamingMessage, setStreamingMessage] = useState(null);
	const [streamingTokenCount, setStreamingTokenCount] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);
	const [isComplete, setIsComplete] = useState(false);
	const [commands] = useState(() => getCommands());
	const [pendingToolCall, setPendingToolCall] = useState(null);
	const [isToolSelectionActive, setIsToolSelectionActive] = useState(false);

	const handleUserSelect = (tool) => {
		setPendingToolCall(tool);
		setIsToolSelectionActive(true);
	};

	const sendMessage = useCallback(
		async (messages) => {
			if (isLoading) return;

			setIsLoading(true);
			setError(null);
			setStreamingMessage('');
			setStreamingTokenCount(0);

			try {
				await generateTextAuto({
					config,
					messages,
					onChangeMessage: setMessages,
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
		},
		[config, isLoading, exit]
	);

	const cancelMessage = useCallback(() => {
		setIsLoading(false);
		setStreamingMessage(null);
		setStreamingTokenCount(0);
		setError('Message cancelled by user');
	}, []);

	const handleToolAccept = useCallback(async () => {
		if (!pendingToolCall) return;

		setIsToolSelectionActive(false);
		setIsLoading(true);

		try {
			// Execute the tool call
			const executeFn = toolsExecute[pendingToolCall.toolName];
			if (!executeFn) {
				throw new Error(`Tool ${pendingToolCall.toolName} not found`);
			}
			const result = await executeFn(pendingToolCall.args);

			// Add tool result to messages
			const toolResultMessage = {
				role: 'tool',
				content: [
					{
						type: 'tool-result',
						toolCallId: pendingToolCall.toolCallId,
						toolName: pendingToolCall.toolName,
						result: result,
						title: `${pendingToolCall.toolName} executed`,
						text: JSON.stringify(result, null, 2),
					},
				],
			};

			const updatedMessages = [...messages, toolResultMessage];
			setMessages(updatedMessages);

			// Continue the conversation
			await sendMessage(updatedMessages);
		} catch (err) {
			setError(`Tool execution failed: ${err.message}`);
		} finally {
			setPendingToolCall(null);
			setIsLoading(false);
		}
	}, [pendingToolCall, messages, sendMessage]);

	const handleToolDecline = useCallback(() => {
		if (!pendingToolCall) return;

		setIsToolSelectionActive(false);

		// Add declined message
		const declinedMessage = {
			role: 'assistant',
			content: `Tool call ${pendingToolCall.toolName} was declined by user.`,
		};

		const updatedMessages = [...messages, declinedMessage];
		// Continue the conversation without the tool
		setMessages(updatedMessages);

		setPendingToolCall(null);
	}, [pendingToolCall, messages, sendMessage]);

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
						messages,
						setMessages,
						onChunk: (textPart, fullMessage, estimatedTokens) => {
							setStreamingTokenCount(estimatedTokens);
							setStreamingMessage(fullMessage); // Still store full message but won't display it
						},
						args,
						onSelect: handleUserSelect,
					});

					if (commandResult)
						setMessages((prev) => [
							...prev,
							{ role: 'assistant', content: commandResult },
						]);
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
			const updatedMessages = [...messages, userMessage];
			setMessages(updatedMessages);
			setCurrentInput('');

			sendMessage(updatedMessages);
		}
	};

	useInput((input, key) => {
		// Block input when tool selection is active
		if (isToolSelectionActive) {
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
		handleToolDecline,
	};
};
