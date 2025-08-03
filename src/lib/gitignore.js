import fs from 'fs';
import path from 'path';

/**
 * Reads and parses .gitignore file to extract ignore patterns
 * @param {string} dir - Directory to look for .gitignore
 * @returns {string[]} Array of glob patterns to ignore
 */
export function getGitignorePatterns(dir = process.cwd()) {
	const gitignorePath = path.join(dir, '.gitignore');

	try {
		if (!fs.existsSync(gitignorePath)) {
			return [];
		}

		const content = fs.readFileSync(gitignorePath, 'utf-8');

		return content
			.split('\n')
			.map((line) => line.trim())
			.filter((line) => line && !line.startsWith('#'))
			.map((pattern) => {
				// Convert gitignore patterns to glob patterns
				if (pattern.endsWith('/')) {
					// Directory pattern - add ** to match all files in directory
					return pattern + '**';
				} else if (!pattern.includes('/') && !pattern.startsWith('*')) {
					// Simple file/directory name - match in any directory
					return '**/' + pattern + '/**';
				} else if (pattern.startsWith('/')) {
					// Root-relative pattern
					return pattern.slice(1) + (pattern.endsWith('/') ? '**' : '');
				} else {
					// Other patterns - keep as-is and add directory variant
					return pattern;
				}
			})
			.filter((pattern) => pattern && pattern.trim());
	} catch (error) {
		console.warn('Warning: Could not read .gitignore:', error.message);
		return [];
	}
}

/**
 * Combines default ignore patterns with .gitignore patterns
 * @param {string[]} defaultPatterns - Default patterns to always ignore
 * @param {string} [dir] - Directory to look for .gitignore
 * @returns {string[]} Combined ignore patterns
 */
export function getIgnorePatterns(defaultPatterns = [], dir) {
	const gitignorePatterns = getGitignorePatterns(dir);
	return [...defaultPatterns, ...gitignorePatterns];
}
