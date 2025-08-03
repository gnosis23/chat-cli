import { tool } from 'ai';
import { z } from 'zod';
import { glob } from 'glob';
import { getIgnorePatterns } from '../lib/gitignore.js';

export const lsTool = tool({
	description:
		'Lists files and subdirectories in a given path. The path parameter must be an absolute path, not a relative path.',
	parameters: z.object({
		path: z
			.string()
			.describe('an absolute path')
			.optional()
			.default(process.cwd()),
	}),
	execute: async ({ path }) => {
		try {
			const pattern = path + (path.endsWith('/') ? '' : '/') + '**';
			const ignorePatterns = getIgnorePatterns(['node_modules/**', '.git/**']);
			const files = await glob(pattern, {
				ignore: ignorePatterns,
			});
			return { files };
		} catch (error) {
			return { files: [], error: `Failed to ls: ${error.message}` };
		}
	},
});

export const lsToolInfo = ({ path }, { files, error }) => {
	return {
		title: path,
		text: error
			? `${error}`
			: `The files in ${path} are:\n${files.map((file) => `- ${file}`).join('\n')}`,
	};
};
