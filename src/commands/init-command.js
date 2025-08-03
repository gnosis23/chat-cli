import { generateTextAuto } from '../lib/chat';

export async function initCommand({ config, messages, setMessages, onChunk }) {
	try {
		const newMessages = [
			...messages,
			{
				role: 'user',
				content: `
            Create a chat-cli.md markdown file for this project that includes:
            - Project overview
            - Architecture
            - Key Components
            - Development and build commands
            - Technical Details
            - Other Notes

            Ensure the format is clear.
        `,
			},
		];
		await generateTextAuto({
			config,
			messages: newMessages,
			onChangeMessage: setMessages,
			onChunk,
		});
	} catch (err) {
		console.log(err?.message);
		return `${err?.message}`;
	}
}
