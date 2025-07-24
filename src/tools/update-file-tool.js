import { z } from 'zod';
import { promises as fs } from 'fs';

export const updateFileTool = {
	description:
		'update content in a file with optional offset and limit on the local filesystem',
	parameters: z.object({
		filePath: z.string().describe('The absolute path to the file to write'),
		content: z.string().describe('The content to write to the file'),
		offset: z
			.number()
			.optional()
			.describe('The line number to start update from (1-indexed)'),
		limit: z
			.number()
			.optional()
			.describe('The maximum number of lines to update'),
	}),
	execute: async ({ filePath, content, offset, limit }) => {
		try {
			const fileContent = await fs.readFile(filePath, 'utf-8');
			const lines = fileContent.split('\n');

			// Apply offset and limit
			const start = offset ? offset - 1 : 0;
			const end = limit ? start + limit : lines.length;

			const newLines = [...lines.slice(0, start), content, ...lines.slice(end)];

			await fs.writeFile(filePath, newLines.join('\n'), 'utf-8');
			return {
				success: true,
				message: `File updated successfully at ${filePath}`,
				replaced: content,
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
	{ filePath, content, offset, limit },
	{ success, message, replaced }
) => {
	let title = filePath;
	if (offset) title += `, ${offset}`;
	if (limit) title += `, ${limit}`;
	return {
		title,
		text: success
			? `update ${filePath}\n${replaced}`
			: `Failed to update file: ${message}`,
	};
};
