import { tool } from 'ai';
import { z } from 'zod';
import { exec } from 'child_process';
import { getGitignorePatterns } from '../lib/gitignore.js';

const bashGrep = (pattern, ignoreDirs = []) => {
	// Build exclude-dir argument from ignore patterns
	const excludeDirs = [...new Set(['node_modules', '.git', ...ignoreDirs])];
	const excludeArg = excludeDirs.map((dir) => `--exclude-dir=${dir}`).join(' ');

	return new Promise((resolve, reject) => {
		exec(`grep -Eri ${excludeArg} "${pattern}" .`, (error, stdout, stderr) => {
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
				.filter((line) => line.trim()) // Filter out empty lines
				.map((line) => {
					const [filePath, ...match] = line.split(':');
					return { filePath, match: match.join(':') };
				});
			resolve(results);
		});
	});
};

export const grepTool = tool({
	description: `
    Search file content for a specific pattern using system grep command
		- support full regex syntax like "log.*Error", "funciton\s+\w+"
    - ignoring cases
    - with file paths and line number
    - ignoring node_modules and .git directories
  `,
	parameters: z.object({
		pattern: z.string().describe(''),
	}),
});

export const grepExecute = async ({ pattern }) => {
	try {
		// Get gitignore patterns and extract directory patterns
		const gitignorePatterns = getGitignorePatterns();
		const ignoreDirs = gitignorePatterns
			.filter((pattern) => pattern.includes('/') || pattern.endsWith('/**'))
			.map((pattern) => pattern.replace('/**', '').replace('**/', ''))
			.filter(
				(pattern) =>
					pattern && !pattern.includes('*') && !pattern.startsWith('!')
			);

		const results = await bashGrep(pattern, ignoreDirs);
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
};

export const grepToolInfo = ({ pattern }, { list }) => {
	return {
		title: `${pattern}`,
		text: list.length
			? list.map(({ filePath, match }) => `- ${filePath}: ${match}`).join('\n')
			: `No matches found for: ${pattern}`,
	};
};
