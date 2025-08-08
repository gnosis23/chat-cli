import { getSystemPrompt } from '../lib/prompt';

export async function clearCommand({ onAddMessage }) {
	try {
		const newMessages = [
			{
				role: 'system',
				content: getSystemPrompt({ custom: true }),
			},
		];

		// FIXME:
		// setMessages((prev) => newMessages);
		return { role: 'gui', content: 'cleared' };
	} catch (err) {
		console.log(err?.message);
		return `${err?.message}`;
	}
}
