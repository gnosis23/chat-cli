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

export const bashTool = tool({
	description: `
		Execute bash commands and return output with exit status
		
		Do not use this tool when:
		- read a file: use readFileTool instead
		- write a file: use writeFileTool instead
		- update a file: use updateFileTool instead
		- search text / grep: use grepTool instead
	`,
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

export const bashToolInfo = (
	{ command },
	{ stdout, stderr, exitCode, success }
) => {
	const summary = success ? 'Command executed successfully' : 'Command failed';
	const output =
		stdout || stderr ? `\n\`\`\`\n${stdout || stderr}\n\`\`\`` : '';

	return {
		title: `${command}`,
		text: `${summary} (exit code: ${exitCode})${output}`,
	};
};
