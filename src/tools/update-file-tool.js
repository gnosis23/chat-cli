import { z } from 'zod';
import { promises as fs } from 'fs';

export const updateFileTool = {
	description:
		'update content in a file with optional offset and limit on the local filesystem',
	parameters: z.object({
		filePath: z.string().describe('The absolute path to the file to write'),
		oldString: z.string().describe('string to replace'),
		newString: z.string().describe('new string to replace with'),
	}),
	execute: async ({ filePath, oldString, newString }) => {
		try {
			const fileContent = await fs.readFile(filePath, 'utf-8');
			const updatedContent = fileContent.replace(oldString, newString);
			await fs.writeFile(filePath, updatedContent, 'utf-8');
			return {
				success: true,
				message: `File updated successfully at ${filePath}`,
				replaced: newString,
			};
		} catch (error) {
			return {
				success: false,
				message: `Failed to update file: ${error.message}`,
			};
		}
	},
};

export const updateFileToolInfo = (
	{ filePath, oldString, newString },
	{ success, message, replaced }
) => {
	let title = filePath;
	return {
		title,
		text: success ? `update ${filePath}\n${replaced}` : message,
	};
};
