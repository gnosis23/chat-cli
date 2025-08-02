import { useInput, useApp } from 'ink';
import { useState, useCallback } from 'react';
import { streamText, APICallError, InvalidToolArgumentsError } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { toolsObject, convertToolResultForUser } from '../tools';
import { commands } from '../commands';
import { systemPrompt } from '../prompt.js';

const convertToAISdkMessages = (messages) => {
	const list = messages
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
						args: x.args,
						result: x.result,
					})),
				};
			}
			return message;
		});

	if (process.env.DEBUG === '1') {
		console.log('messages:');
		console.log(JSON.stringify(list, null, 2));
	}

	return list;
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
	const [isComplete, setIsComplete] = useState(false);

	const model =
		config.model ||
		process.env.CHATCLI_MODEL ||
		'deepseek/deepseek-chat-v3-0324';

	const openai = createOpenAI({
		baseURL: 'https://openrouter.ai/api/v1',
		apiKey: config.apiKey || process.env.OPENROUTER_API_KEY,
		// custom settings, e.g.
		headers: {
			'X-Title': 'chat-cli',
		},
	});

	const sendMessage = useCallback(
		async (messages, onChunk) => {
			if (isLoading) return;

			setIsLoading(true);
			setError(null);
			setStreamingMessage('');
			setStreamingTokenCount(0);

			const currentMessages = [...messages];

			try {
				// main loop
				while (true) {
					const streamResult = streamText({
						model: openai.chat(model),
						messages: convertToAISdkMessages(currentMessages),
						temperature: config.temperature || 0.7,
						tools: { ...config.tools, ...toolsObject },
						onStepFinish({ text, toolCalls, toolResults }) {
							if (text) {
								currentMessages.push({ role: 'assistant', content: text });
							}

							if (toolCalls.length) {
								currentMessages.push({
									role: 'assistant',
									content: toolCalls.map((toolCall) => ({
										type: 'tool-call',
										toolCallId: toolCall.toolCallId,
										toolName: toolCall.toolName,
										args: toolCall.args || {},
									})),
								});
							}

							if (toolResults.length) {
								currentMessages.push({
									role: 'tool',
									content: toolResults.map((toolResult) => {
										const resultForUser = convertToolResultForUser(toolResult);
										return {
											type: 'tool-result',
											toolCallId: toolResult.toolCallId,
											toolName: toolResult.toolName,
											result: toolResult.result,
											// custom field
											title: resultForUser.title,
											text: resultForUser.text,
										};
									}),
								});
							}

							if (process.env.DEBUG === '1') {
								console.log(
									'---------------------------------------------------'
								);
								console.log('onStepFinish:');
								console.log('text:', text);
								console.log('toolCalls:', toolCalls);
								console.log('toolResults:', toolResults);
								console.log(
									'---------------------------------------------------'
								);
							}

							setMessages([...currentMessages]);
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

							currentMessages.push({
								role: 'assistant',
								content: errorMessage,
							});
							setMessages([...currentMessages]);
						},
					});

					let fullMessage = '';
					for await (const textPart of streamResult.textStream) {
						fullMessage += textPart;
						// Estimate tokens: roughly 4 characters per token
						const estimatedTokens = Math.ceil(fullMessage.length / 4);
						setStreamingTokenCount(estimatedTokens);
						setStreamingMessage(fullMessage); // Still store full message but won't display it
						onChunk?.(textPart, fullMessage);
					}

					const finishReason = await streamResult.finishReason;
					const usage = await streamResult.usage;

					currentMessages.push({
						role: 'gui',
						content: [
							{ type: 'finishReason', text: finishReason },
							{ type: 'usage', usage },
						],
					});
					setMessages([...currentMessages]);

					if (['stop', 'error'].includes(finishReason)) {
						break;
					}
				}
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
		[model, config, isLoading, exit]
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
				const func = commands[words[0]].func;
				func(config);
				setCurrentInput('');
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
