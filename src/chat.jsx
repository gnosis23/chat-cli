import React, {useState, useEffect} from 'react';
import {useInput, useApp, Box, Text, Static} from 'ink';
import Spinner from 'ink-spinner';
import {GAP_SIZE} from './constant.js';
import {useAIChat} from './hooks/use-ai-chat.js';
import {AIMessage, ErrorMessage} from './components/ai-message.jsx';
import {HistoryMessage} from './components/history-message.jsx';
import TextInput from './components/text-input.jsx';

export default function ChatApp({config = {}}) {
	const {exit} = useApp();
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
	const [streamingMessage, setStreamingMessage] = useState('');

	const {
		sendMessage,
		cancelMessage,
		streamingMessage: aiStreamingMessage,
		streamingTokenCount,
		isLoading,
		error,
	} = useAIChat(config);

	const handleSubmit = inputText => {
		if (inputText.trim()) {
			const userMessage = {type: 'user', text: inputText.trim()};
			const updatedMessages = [...messages, userMessage];
			setMessages(updatedMessages);
			setCurrentInput('');

			sendMessage(updatedMessages, (chunk, fullMessage) => {
				// Streaming updates handled by useEffect
			})
				.then(fullResponse => {
					if (fullResponse) {
						setMessages(prev => [...prev, {type: 'bot', text: fullResponse}]);
					}
				})
				.catch(err => {
					// Error handled by useAIChat hook
				});
		}
	};

	useEffect(() => {
		if (aiStreamingMessage !== null) {
			setStreamingMessage(aiStreamingMessage);
		} else {
			setStreamingMessage('');
		}
	}, [aiStreamingMessage]);

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

	return (
		<Box flexDirection="column" gap={0}>
			{/* Message history */}
			<Box marginBottom={1} minWidth={120}>
				<Static items={messages}>
					{(item, index) => (
						<HistoryMessage key={index} message={item} index={index} />
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

			{/* Input box */}
			<TextInput
				value={currentInput}
				onChange={setCurrentInput}
				onSubmit={handleSubmit}
				prefix="> "
			/>

			{/* Help text */}
			<Box marginBottom={1}>
				<Text color="white" dimColor>
					{isLoading
						? 'Press Ctrl+C to cancel'
						: 'Press Enter to send | Press Ctrl+C to exit | Arrow keys to navigate'}
				</Text>
			</Box>
		</Box>
	);
}
