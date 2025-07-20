import {useState, useCallback} from 'react';
import {streamText, smoothStream} from 'ai';
import {createOpenAI} from '@ai-sdk/openai';

export const useAIChat = (config = {}) => {
	const [streamingMessage, setStreamingMessage] = useState(null);
	const [streamingTokenCount, setStreamingTokenCount] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);

	const deepseek = createOpenAI({
		baseURL: config.baseUrl || 'https://api.deepseek.com/v1',
		apiKey: config.apiKey || process.env.DEEPSEEK_API_KEY,
	});

	const model = config.model || process.env.DEEPSEEK_MODEL || 'deepseek-chat';

	const sendMessage = useCallback(
		async (messages, onChunk) => {
			if (isLoading) return;

			setIsLoading(true);
			setError(null);
			setStreamingMessage('');
			setStreamingTokenCount(0);

			try {
				const result = streamText({
					model: deepseek(model),
					messages: messages.map(msg => ({
						role: msg.type === 'user' ? 'user' : 'assistant',
						content: msg.text,
					})),
					temperature: config.temperature || 0.7,
					maxTokens: config.maxTokens || 1000,
					experimental_transform: smoothStream({
						delayInMs: 500, // optional: defaults to 10ms
						chunking: 'line', // optional: defaults to 'word'
					}),
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
		[deepseek, model, config, isLoading],
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
