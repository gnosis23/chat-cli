import React, {useState} from 'react';
import {useInput, useApp, Box, Text} from 'ink';
import Spinner from 'ink-spinner';

export default function ChatApp() {
	const {exit} = useApp();
	const [messages, setMessages] = useState([
		{
			type: 'system',
			text: 'Welcome to the chat cli! Type a message and press Enter to send, press Ctrl+C to exit.',
		},
	]);
	const [currentInput, setCurrentInput] = useState('');
	const [loading, setLoading] = useState(false);

	useInput((input, key) => {
		if (key.ctrl && input === 'c') {
			exit();
		}

		if (key.return) {
			if (currentInput.trim()) {
				// Add user message
				const newMessages = [
					...messages,
					{type: 'user', text: currentInput.trim()},
				];
				setLoading(true);
				setMessages(newMessages);
				setCurrentInput('');

				// Add bot reply (TODO)
				const finalMessages = [
					...newMessages,
					{type: 'bot', text: 'TODO: ' + currentInput.trim()},
				];

				setTimeout(() => {
					setMessages(finalMessages);
					setLoading(false);
				}, 2000);
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
		<Box flexDirection="column" height="100%">
			{/* Title */}
			<Box marginTop={2} marginBottom={2}>
				<Text bold color="cyan">
					🗨️ Chat Cli
				</Text>
			</Box>

			{/* Message history */}
			<Box flexDirection="column" flexGrow={1} marginBottom={1}>
				{messages.map((message, index) => renderMessage(message, index))}
				{loading && (
					<Box marginBottom={1}>
						<Text color="white">
							<Spinner type="dots" /> Thinking...
						</Text>
					</Box>
				)}
			</Box>

			{/* Input box */}
			{!loading && (
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
					Press Enter to send message | Press Ctrl+C to exit
				</Text>
			</Box>
		</Box>
	);
}
