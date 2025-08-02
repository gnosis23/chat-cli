import { z } from 'zod';
import { promises as fs } from 'fs';

export const readFileTool = {
	description:
		'Read a file from the local filesystem with optional line range support',
	parameters: z.object({
		filePath: z.string().describe('The absolute path to the file to read'),
		offset: z
			.number()
			.positive()
			.optional()
			.describe(
				'The line number to start reading from (1-indexed), must be greater than 0'
			),
		limit: z
			.number()
			.optional()
			.describe('The maximum number of lines to read'),
	}),
	execute: async ({ filePath, offset, limit }) => {
		try {
			const content = await fs.readFile(filePath, 'utf-8');
			const lines = content.split('\n');

			let startIndex = 0;
			let endIndex = lines.length;

			if (offset && offset > 0) {
				startIndex = offset - 1;
			}

			if (limit && limit > 0) {
				endIndex = Math.min(startIndex + limit, lines.length);
			}

			const selectedLines = lines.slice(startIndex, endIndex);
			const result = selectedLines.join('\n');

			return {
				success: true,
				text: result,
				lineCount: result.split('\n').length,
				totalLines: lines.length,
			};
		} catch (error) {
			return {
				success: false,
				text: `Failed to read file: ${error.message}`,
			};
		}
	},
};

export const readFileToolInfo = (
	{ filePath, offset, limit },
	{ success, text }
) => {
	let title = filePath;
	if (offset) title += `, ${offset}`;
	if (limit) title += `, ${limit}`;
	return {
		title,
		text: success ? `Read ${limit || 'all'} lines from ${filePath}` : text,
	};
};
