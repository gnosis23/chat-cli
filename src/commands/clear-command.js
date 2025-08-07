import { getSystemPrompt } from '../lib/prompt';

export async function clearCommand({ setMessages }) {
	try {
		const newMessages = [
			{
				role: 'system',
				content: getSystemPrompt({ custom: true }),
			},
		];
		setMessages((prev) => newMessages);
		return { role: 'gui', content: 'cleared' };
	} catch (err) {
		console.log(err?.message);
		return `${err?.message}`;
	}
}
