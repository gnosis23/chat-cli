import { useInput, useApp } from 'ink';
import { useState, useCallback } from 'react';
import { toolsExecute } from '../tools';
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

	const handleUserSelect = (tool) => {
		console.log('onSelect', tool);
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
	};
};
