import { z } from 'zod';
import { promises as fs } from 'fs';

export const writeFileTool = {
	description: 'write content to a file on the local filesystem',
	parameters: z.object({
		filePath: z.string().describe('The absolute path to the file to write'),
		content: z.string().describe('The content to write to the file'),
	}),
	execute: async ({ filePath, content }) => {
		try {
			await fs.writeFile(filePath, content, 'utf-8');
			return {
				success: true,
				message: `File written successfully to ${filePath}`,
			};
		} catch (error) {
			return {
				success: false,
				message: `Failed to write file: ${error.message}`,
			};
		}
	},
};

export const writeFileToolInfo = (
	{ filePath, content },
	{ success, message }
) => {
	return {
		title: filePath,
		text: success
			? `Wrote lines to ${filePath}`
			: `Failed to write file: ${error.message}`,
	};
};
