import React, {useState, useEffect} from 'react';
import {useInput, useApp, Box, Text, Static} from 'ink';
import Spinner from 'ink-spinner';
import {useAIChat} from './hooks/use-ai-chat.js';
import {AIMessage, LoadingIndicator, ErrorMessage} from './components/ai-message.js';

export default function ChatApp({ config = {} }) {
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
		isLoading,
		error,
	} = useAIChat(config);

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

		if (key.return) {
			if (currentInput.trim()) {
				const userMessage = {type: 'user', text: currentInput.trim()};
				const updatedMessages = [...messages, userMessage];
				setMessages(updatedMessages);
				setCurrentInput('');

				sendMessage(updatedMessages, (chunk, fullMessage) => {
					// Streaming updates handled by useEffect
				}).then((fullResponse) => {
					if (fullResponse) {
						setMessages(prev => [...prev, {type: 'bot', text: fullResponse}]);
					}
				}).catch((err) => {
					// Error handled by useAIChat hook
				});
			}
		} else if (key.backspace || key.delete) {
			setCurrentInput(prev => prev.slice(0, -1));
		} else if (!key.ctrl && !key.meta && input) {
			setCurrentInput(prev => prev + input);
		}
	});

	const renderMessage = (message, index) => {
		const colors = {
			user: 'blue',
			bot: 'white',
			system: 'white',
		};

		const prefixes = {
			user: '> ',
			bot: '. ',
			system: '💡 ',
		};

		return (
			<Box key={index} marginBottom={1}>
				<Text color={colors[message.type]}>
					{prefixes[message.type]}
					{message.text}
				</Text>
			</Box>
		);
	};

	return (
		<Box flexDirection="column" gap={0}>
			{/* Message history */}
			<Box marginBottom={1} minWidth={120}>
				<Static items={messages}>
					{(item, index) => renderMessage(item, index)}
				</Static>
				{streamingMessage && (
					<AIMessage message={streamingMessage} isStreaming={true} />
				)}
				{isLoading && !streamingMessage && (
					<Box marginBottom={1}>
						<Text color="white">
							<Spinner type="dots" /> Thinking...
						</Text>
					</Box>
				)}
				{error && <ErrorMessage error={error} />}
			</Box>

			{/* Input box */}
			{!isLoading && (
				<Box borderStyle="single" borderColor="white">
					<Text color="yellow"> {'>'} </Text>
					<Text>
						{currentInput}
						<Text backgroundColor="white" color="black">
							{' '}
						</Text>
					</Text>
				</Box>
			)}

			{/* Help text */}
			<Box marginBottom={1}>
				<Text color="white" dimColor>
					{isLoading ? 'Press Ctrl+C to cancel' : 'Press Enter to send | Press Ctrl+C to exit'}
				</Text>
			</Box>
		</Box>
	);
}
