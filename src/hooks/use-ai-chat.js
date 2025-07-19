import {useState, useCallback} from 'react';
import {streamText} from 'ai';
import {createOpenAI} from '@ai-sdk/openai';

export const useAIChat = (config = {}) => {
	const [streamingMessage, setStreamingMessage] = useState(null);
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

			try {
				const result = streamText({
					model: deepseek(model),
					messages: messages.map(msg => ({
						role: msg.type === 'user' ? 'user' : 'assistant',
						content: msg.text,
					})),
					temperature: config.temperature || 0.7,
					maxTokens: config.maxTokens || 1000,
				});

				let fullMessage = '';
				for await (const textPart of result.textStream) {
					fullMessage += textPart;
					setStreamingMessage(fullMessage);
					onChunk?.(textPart, fullMessage);
				}

				return fullMessage;
			} catch (err) {
				setError(err.message);
				throw err;
			} finally {
				setIsLoading(false);
				setStreamingMessage(null);
			}
		},
		[deepseek, model, config, isLoading],
	);

	const cancelMessage = useCallback(() => {
		setIsLoading(false);
		setStreamingMessage(null);
		setError('Message cancelled by user');
	}, []);

	return {
		sendMessage,
		cancelMessage,
		streamingMessage,
		isLoading,
		error,
	};
};
