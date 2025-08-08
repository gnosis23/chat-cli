import { tool } from 'ai';
import { z } from 'zod';
import { glob } from 'glob';
import { getIgnorePatterns } from '../lib/gitignore.js';

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
});

export const globExecute = async ({ pattern }) => {
	try {
		const ignorePatterns = getIgnorePatterns(['node_modules/**', '.git/**']);
		const files = await glob(pattern, {
			ignore: ignorePatterns,
		});
		return { files };
	} catch (error) {
		return { files: [], error: `Failed to glob files: ${error.message}` };
	}
};

export const globToolInfo = ({ pattern }, { files, error }) => {
	return {
		title: pattern,
		text: error
			? `${error}`
			: `The files matching the pattern "${pattern}" are:\n${files.map((file) => `- ${file}`).join('\n')}`,
	};
};
