import { useCallback, useRef, useState } from 'react';
import { getSystemPrompt } from '../lib/prompt';

const defaultPrompt = getSystemPrompt({ custom: true });

export function useMessage() {
	const [messages, setMessages] = useState(() => {
		return [
			{
				role: 'system',
				content: defaultPrompt,
			},
		];
	});
	const messagesRef = useRef([
		{
			role: 'system',
			content: defaultPrompt,
		},
	]);

	const onAddMessage = useCallback((msg) => {
		messagesRef.current.push(msg);
		setMessages((prev) => {
			return [...prev, msg];
		});
	}, []);

	return {
		messages,
		onAddMessage,
		messagesRef,
	};
}
