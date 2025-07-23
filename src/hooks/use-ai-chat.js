import {useState, useCallback} from 'react';
import {streamText, smoothStream} from 'ai';
import {createOpenRouter} from '@openrouter/ai-sdk-provider';
import {fetchTool} from '../tools/fetch-tool.js';
import {weatherTool} from '../tools/weather-tool.js';

export const useAIChat = (config = {}) => {
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
					messages: messages.map(msg => ({
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
					experimental_transform: smoothStream({
						delayInMs: 500, // optional: defaults to 10ms
						chunking: 'line', // optional: defaults to 'word'
					}),
					onStepFinish({text, toolCalls, toolResults, finishReason, usage}) {
						console.log('---------------------------------------------------');
						console.log('onStepFinish:');
						console.log('text:', text);
						console.log('toolCalls:', toolCalls);
						console.log('toolResults:', toolResults);
						console.log(
							'---------------------------------------------------\n',
						);
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
		[model, config, isLoading],
	);

	const cancelMessage = useCallback(() => {
		setIsLoading(false);
		setStreamingMessage(null);
		setStreamingTokenCount(0);
		setError('Message cancelled by user');
	}, []);

	return {
		sendMessage,
		cancelMessage,
		streamingMessage,
		streamingTokenCount,
		isLoading,
		error,
	};
};
