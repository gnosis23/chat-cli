/**
 * WARNING:
 *    use bashTool is dangerous, it can execute any command on your system.
 *    Use it with caution and only with trusted input.
 */

import { tool } from 'ai';
import { z } from 'zod';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function executeCommand(command, timeout = 30000) {
	try {
		const { stdout, stderr } = await execAsync(command, {
			timeout,
			env: { ...process.env },
		});

		return {
			command,
			stdout: stdout.trim(),
			stderr: stderr.trim(),
			exitCode: 0,
			success: true,
		};
	} catch (error) {
		return {
			command,
			stdout: error.stdout?.trim() || '',
			stderr: error.stderr?.trim() || error.message,
			exitCode: error.code || 1,
			success: false,
		};
	}
}

const bashDescription = `
Execute bash commands and return output with exit status

Do not use this tool when:
- read a file: use readFileTool instead
- write a file: use writeFileTool instead
- update a file: use updateFileTool instead
- search text / grep: use grepTool instead
- list files / glob: use globTool instead

## Git

When the user asks you to create a git commit, follow these steps carefully:
- "git status" to ensure that all relevant files are tacked and staged, using "git add ..." as needed.
- "git diff HEAD" to review all changes (including unstaged changes) to tracked files in work tree since last commit.
- "git diff --staged" to review only staged changes when a partial commit makes sense or was requested by user.
- "git log -n 3" to review recent commit messages and match their style (verbosity, formatting etc.)

Combine shell commands whenever possible to save time/steps, e.g. "git status && git diff HEAD && git log -n 3".
Always propose a draft commit message. Never just ask the user to give you the full commit message.
Prefer commit messages that are clear, concise, and focused more on "why" and less on "what".
Keep the user informed and ask for clarification or confirmation where needed.
After each commit, confirm that it was successful by running "git status".
If a commit fails, never attempt to work around the issues without being asked to do so.
Never push changes to a remote repository without being asked explicitly by the user.

## gh command

Use the gh command via the Bash tool for ALL Github-related tasks like issues, pull requests.
If given a Github URL use the gh command to get the information needed.

`;

export const bashTool = tool({
	description: bashDescription,
	parameters: z.object({
		command: z.string().describe('The bash command to execute'),
		timeout: z
			.number()
			.optional()
			.describe('Timeout in milliseconds (default: 30000)'),
	}),
	execute: async ({ command, timeout = 30000 }) => {
		const result = await executeCommand(command, timeout);
		return {
			command: result.command,
			stdout: result.stdout,
			stderr: result.stderr,
			exitCode: result.exitCode,
			success: result.success,
		};
	},
});

function topOutput(output) {
	if (!output) return '';
	const lines = output.split('\n').filter((line) => line.trim() !== '');
	let ret = lines.slice(0, 5).join('\n');
	if (lines.length > 5) {
		ret += `\n... (${lines.length - 5} more lines)`;
	}
	return ret;
}

export const bashToolInfo = (
	{ command },
	{ stdout, stderr, exitCode, success }
) => {
	const summary = success ? 'Command executed successfully' : 'Command failed';
	const output =
		stdout || stderr ? `\n\`\`\`\n${topOutput(stdout || stderr)}\n\`\`\`` : '';

	return {
		title: `${command}`,
		text: `${summary} (exit code: ${exitCode})${output}`,
	};
};
