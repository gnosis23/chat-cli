import React, {useState} from 'react';
import {useInput, useApp, Box, Text} from 'ink';

export default function ChatApp() {
	const {exit} = useApp();
	const [messages, setMessages] = useState([
		{
			type: 'system',
			text: '欢迎使用聊天应用！输入消息后按Enter发送，按Ctrl+C退出。',
		},
	]);
	const [currentInput, setCurrentInput] = useState('');
	const [isComposing, setIsComposing] = useState(false);

	useInput((input, key) => {
		if (key.ctrl && input === 'c') {
			exit();
		}

		if (key.return) {
			if (currentInput.trim()) {
				// 添加用户消息
				const newMessages = [
					...messages,
					{type: 'user', text: currentInput.trim()},
				];

				// 添加机器人回复 (TODO)
				const finalMessages = [
					...newMessages,
					{type: 'bot', text: 'TODO: ' + currentInput.trim()},
				];

				setMessages(finalMessages);
				setCurrentInput('');
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
			system: 'gray',
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
			{/* 标题 */}
			<Box marginBottom={1}>
				<Text bold color="cyan">
					🗨️ 聊天对话应用
				</Text>
			</Box>

			{/* 消息历史 */}
			<Box flexDirection="column" flexGrow={1} marginBottom={1}>
				{messages.map((message, index) => renderMessage(message, index))}
			</Box>

			{/* 输入框 */}
			<Box borderStyle="single" borderColor="gray">
				<Text color="yellow"> {'>'} </Text>
				<Text>
					{currentInput}
					<Text backgroundColor="white" color="black">
						{' '}
					</Text>
				</Text>
			</Box>

			{/* 提示信息 */}
			<Box marginTop={1}>
				<Text color="gray" dimColor>
					按 Enter 发送消息 | 按 Ctrl+C 退出
				</Text>
			</Box>
		</Box>
	);
}
