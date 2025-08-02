import { generateTextAuto } from '../lib/chat';
import { getSystemPrompt } from '../prompt';

export async function initCommand(config, setMessages, onChunk) {
	try {
		const messages = [
			{
				role: 'system',
				content: getSystemPrompt(false),
			},
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
			messages,
			onChangeMessage: setMessages,
			onChunk,
		});
	} catch (err) {
		console.log(err?.message);
		return `${err?.message}`;
	}
}
