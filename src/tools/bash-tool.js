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

Before executing the command, please follow these steps:
1. Directory Verification:
	- If the command will create new directories or files, first use the LS tool to verify the parent directory exists and is the correct location
	- For example, before running "mkdir foo/bar", first use LS to check that "foo" exists and is the intended parent directory
2. Command Execution:
	- Always quote file paths that contain spaces with double quotes (e.g., cd "path with spaces/file.txt")
	- Examples of proper quoting:
		* cd "/Users/name/My Documents" (correct)
		* cd /Users/name/My Documents (incorrect - will fail)
		* python "/path/with spaces/script.py" (correct)
		* python /path/with spaces/script.py (incorrect - will fail)
	- After ensuring proper quoting, execute the command.
	- Capture the output of the command.

Usage notes:
- VERY IMPORTANT: You MUST avoid using search commands like "find" and "grep". Instead use Grep, Glob to search. 
- VERY IMPORTANT: You MUST avoid read tools like "cat", "head", "tail", and "ls", and use ReadFile and LS to read files.
- If you still need to run grep, STOP. ALWAYS USE ripgrep at "rg" first
- write a file: use WriteFile instead
- update a file: use UpdateFile instead


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
});

export const bashExecute = async ({ command, timeout = 30000 }) => {
	const result = await executeCommand(command, timeout);
	return {
		command: result.command,
		stdout: result.stdout,
		stderr: result.stderr,
		exitCode: result.exitCode,
		success: result.success,
	};
};

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
	const output = stdout || stderr ? `\n${topOutput(stdout || stderr)}\n` : '';

	return {
		title: `${command}`,
		text: success ? output : `${summary} (exit code: ${exitCode})`,
	};
};
