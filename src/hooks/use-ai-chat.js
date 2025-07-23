import { useInput, useApp } from 'ink';
import { useState, useCallback } from 'react';
import { streamText } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { fetchTool, fetchToolInfo } from '../tools/fetch-tool.js';
import { weatherTool, weatherToolInfo } from '../tools/weather-tool.js';

export const useAIChat = (config = {}) => {
	const { exit } = useApp();
	const [messages, setMessages] = useState([
		{
			type: 'system',
			text: 'Welcome to the AI chat CLI! Type a message and press Enter to send, press Ctrl+C to exit.',
		},
		{
			type: 'system',
			text: 'AI assistance enabled with DeepSeek integration.',
		},
	]);
	const [currentInput, setCurrentInput] = useState('');
	const [streamingMessage, setStreamingMessage] = useState(null);
	const [streamingTokenCount, setStreamingTokenCount] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);

	const openrouter = createOpenRouter({
		apiKey: config.apiKey || process.env.OPENROUTER_API_KEY,
	});

	const model =
		config.model ||
		process.env.CHATCLI_MODEL ||
		'deepseek/deepseek-chat-v3-0324';

	const sendMessage = useCallback(
		async (messages, onChunk) => {
			if (isLoading) return;

			setIsLoading(true);
			setError(null);
			setStreamingMessage('');
			setStreamingTokenCount(0);

			try {
				const result = streamText({
					model: openrouter.chat(model),
					messages: messages
						.filter((x) => x.type !== 'tool')
						.map((msg) => ({
							role: msg.type === 'user' ? 'user' : 'assistant',
							content: msg.text,
						})),
					temperature: config.temperature || 0.7,
					maxTokens: config.maxTokens || 1000,
					maxSteps: 10,
					tools: {
						fetch: fetchTool,
						weather: weatherTool,
					},
					onStepFinish({ text, toolCalls, toolResults }) {
						// console.log('---------------------------------------------------');
						// console.log('onStepFinish:');
						// console.log('text:', text);
						// console.log('toolCalls:', toolCalls);
						// console.log('toolResults:', toolResults);

						if (toolResults.length) {
							for (const toolResult of toolResults) {
								let text = null;
								switch (toolResult.toolName) {
									case 'fetch':
										text = fetchToolInfo(toolResult.args, toolResult.result);
										break;
									case 'weather':
										text = weatherToolInfo(toolResult.args, toolResult.result);
										break;
									default:
										text = `Tool ${toolResult.toolName} executed with result: ${JSON.stringify(toolResult.result)}`;
								}
								setMessages((prev) => [
									...prev,
									{ type: 'tool', toolName: toolResult.toolName, text },
								]);
							}
						}
					},
				});

				let fullMessage = '';
				for await (const textPart of result.textStream) {
					fullMessage += textPart;
					// Estimate tokens: roughly 4 characters per token
					const estimatedTokens = Math.ceil(fullMessage.length / 4);
					setStreamingTokenCount(estimatedTokens);
					setStreamingMessage(fullMessage); // Still store full message but won't display it
					onChunk?.(textPart, fullMessage);
				}

				return fullMessage;
			} catch (err) {
				setError(err.message);
				throw err;
			} finally {
				setIsLoading(false);
				setStreamingMessage(null);
				setStreamingTokenCount(0);
			}
		},
		[model, config, isLoading]
	);

	const cancelMessage = useCallback(() => {
		setIsLoading(false);
		setStreamingMessage(null);
		setStreamingTokenCount(0);
		setError('Message cancelled by user');
	}, []);

	const handleSubmit = (inputText) => {
		if (inputText.trim()) {
			const userMessage = { type: 'user', text: inputText.trim() };
			const updatedMessages = [...messages, userMessage];
			setMessages(updatedMessages);
			setCurrentInput('');

			sendMessage(updatedMessages, (chunk, fullMessage) => {})
				.then((fullResponse) => {
					if (fullResponse) {
						setMessages((prev) => [
							...prev,
							{ type: 'bot', text: fullResponse },
						]);
					}
				})
				.catch((err) => {
					// Error handled by useAIChat hook
				});
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
	};
};
