import { generateTextAuto } from '../lib/chat';

export async function initCommand({
	config,
	messagesRef,
	onAddMessage,
	onChunk,
	onSelect,
	onUsage,
}) {
	try {
		onAddMessage({
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
		});

		await generateTextAuto({
			config,
			messagesRef,
			onAddMessage,
			onChunk,
			onSelect,
			onUsage,
		});
	} catch (err) {
		console.log(err?.message);
		return `${err?.message}`;
	}
}
