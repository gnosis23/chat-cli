import { tool } from 'ai';
import { z } from 'zod';
import { exec } from 'child_process';

const bashGrep = (pattern) => {
	return new Promise((resolve, reject) => {
		exec(
			`grep -ri --exclude-dir={node_modules,.git} "${pattern}" .`,
			(error, stdout, stderr) => {
				if (error) {
					reject(`Error executing grep: ${error.message}`);
					return;
				}
				if (stderr) {
					reject(`Grep error: ${stderr}`);
					return;
				}
				const results = stdout
					.trim()
					.split('\n')
					.map((line) => {
						const [filePath, ...match] = line.split(':');
						return { filePath, match: match.join(':') };
					});
				resolve(results);
			}
		);
	});
};

export const grepTool = tool({
	description: `
    Grep files for a specific pattern using system grep command
    - ignoring cases
    - with file paths and line number
    - ignoring node_modules and .git directories
  `,
	parameters: z.object({
		pattern: z.string().describe(''),
	}),
	execute: async ({ pattern }) => {
		try {
			const results = await bashGrep(pattern);
			return {
				pattern: pattern,
				list: results,
			};
		} catch (err) {
			return {
				pattern: pattern,
				list: [],
				error: `Error executing grep: ${err.message}`,
			};
		}
	},
});

export const grepToolInfo = ({ pattern }, { list }) => {
	return {
		title: `${pattern}`,
		text: list.length
			? list.map(({ filePath, match }) => `- ${filePath}: ${match}`).join('\n')
			: `No matches found for: ${pattern}`,
	};
};
