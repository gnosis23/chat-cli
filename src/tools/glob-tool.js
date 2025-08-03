import { tool } from 'ai';
import { z } from 'zod';
import { glob } from 'glob';

export const globTool = tool({
	description: `
		Search files matching a pattern, ignoring node_modules and .git directories
		Use this tool when you need to find files by name patterns
	`,
	parameters: z.object({
		pattern: z
			.string()
			.describe('The glob pattern to match files like "/*.js" or "src/*.ts"'),
	}),
	execute: async ({ pattern }) => {
		try {
			const files = await glob(pattern, {
				ignore: ['node_modules/**', '.git/**'],
			});
			return { files };
		} catch (error) {
			return { files: [], error: `Failed to glob files: ${error.message}` };
		}
	},
});

export const globToolInfo = ({ pattern }, { files, error }) => {
	return {
		title: pattern,
		text: error
			? `${error}`
			: `The files matching the pattern "${pattern}" are:\n${files.map((file) => `- ${file}`).join('\n')}`,
	};
};
