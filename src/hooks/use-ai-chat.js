import { useInput, useApp } from 'ink';
import { useState, useCallback } from 'react';
import { streamText, APICallError, InvalidToolArgumentsError } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { toolsObject, getToolResult } from '../tools';
import { commands } from '../commands';
import { systemPrompt } from '../prompt.js';

const convertToAISdkMessages = (messages) => {
	return messages
		.filter((x) => x.role != 'gui')
		.map((message) => {
			if (message.role === 'tool') {
				// remove title in content
				return {
					role: 'tool',
					content: message.content.map((x) => ({
						type: 'tool-result',
						toolCallId: x.toolCallId,
						toolName: x.toolName,
						result: x.text,
					})),
				};
			}
			return message;
		});
};

export const useAIChat = (config = {}) => {
	const { exit } = useApp();
	const [messages, setMessages] = useState([
		{
			role: 'system',
			content: systemPrompt,
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
					messages: convertToAISdkMessages(messages),
					temperature: config.temperature || 0.7,
					maxSteps: 20,
					tools: toolsObject,
					onStepFinish({ text, toolCalls, toolResults }) {
						if (process.env.DEBUG === '1') {
							console.log(
								'---------------------------------------------------'
							);
							console.log('onStepFinish:');
							console.log('text:', text);
							console.log('toolCalls:', toolCalls);
							console.log('toolResults:', toolResults);
						}

						if (text) {
							setMessages((prev) => [
								...prev,
								{ role: 'assistant', content: text },
							]);
						}

						if (toolCalls.length) {
							setMessages((prev) => [
								...prev,
								{
									role: 'assistant',
									content: toolCalls.map((toolCall) => ({
										type: 'tool-call',
										toolCallId: toolCall.toolCallId,
										toolName: toolCall.toolName,
										args: toolCall.args || {},
									})),
								},
							]);
						}

						if (toolResults.length) {
							setMessages((prev) => [
								...prev,
								{
									role: 'tool',
									content: toolResults.map((toolResult) => {
										const result = getToolResult(toolResult);
										return {
											type: 'tool-result',
											toolCallId: toolResult.toolCallId,
											toolName: toolResult.toolName,
											result: result.text,
											// custom field
											title: result.title,
										};
									}),
								},
							]);
						}
					},
					onError(e) {
						const error = e?.error || e;
						let errorMessage;
						if (APICallError.isInstance(error)) {
							errorMessage =
								'Unauthorized request. Please set your $OPENROUTER_API_KEY.';
						} else if (InvalidToolArgumentsError.isInstance(error)) {
							errorMessage = `call ${error.toolName} failed: ${error.message}`;
						} else {
							console.error('Error in AI chat:', error);
							errorMessage = 'Unknown error';
						}

						setMessages((prev) => [
							...prev,
							{ role: 'assistant', content: errorMessage },
						]);
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
			const words = inputText.trim().split(/\s+/);
			if (words[0] && commands[words[0]]) {
				const func = commands[words[0]];
				func();
				setCurrentInput('');
				return;
			}

			const userMessage = { role: 'user', content: inputText.trim() };
			const updatedMessages = [...messages, userMessage];
			setMessages(updatedMessages);
			setCurrentInput('');

			sendMessage(updatedMessages, (chunk, fullMessage) => {})
				.then((fullResponse) => {})
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
