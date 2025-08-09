export async function initCommand({}) {
	return {
		role: 'user',
		content: `
			Please complete the following task directly, without asking for confirmation each time.

			Create a chat-cli.md markdown file for this project that includes:
			- Project overview
			- Architecture
			- Key Components
			- Development and build commands
			- Technical Details
			- Other Notes

			Ensure the format is clear.
		`,
	};
}
